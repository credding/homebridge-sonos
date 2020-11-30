import fetch, { Response } from "node-fetch";
import { URLSearchParams } from "url";

const SONOS_AUTHORIZATION_API = "https://api.sonos.com/login/v3";
const SONOS_CONTROL_API = "https://api.ws.sonos.com/control/api/v1";

const CONTENT_TYPE_JSON_HEADER = ["Content-Type", "application/json"];

export class SonosApi {
  private accessToken: string = "";

  constructor(private clientKey: string, private clientSecret: string) {}

  async createToken(
    authorizationCode: string,
    redirectUri: string
  ): Promise<RefreshTokenResponse> {
    const endpoint = `${SONOS_AUTHORIZATION_API}/oauth/access`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBasicAuthorizationHeader()],
      body: new URLSearchParams([
        ["grant_type", "authorization_code"],
        ["code", authorizationCode],
        ["redirect_uri", redirectUri],
      ]),
    });

    const {
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken,
    } = await getSuccessfulResponseJson(response);

    this.accessToken = accessToken;
    return { expiresIn, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const endpoint = `${SONOS_AUTHORIZATION_API}/oauth/access`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBasicAuthorizationHeader()],
      body: new URLSearchParams([
        ["grant_type", "refresh_token"],
        ["refresh_token", refreshToken],
      ]),
    });

    const {
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: newRefreshToken,
    } = await getSuccessfulResponseJson(response);

    this.accessToken = accessToken;
    return { expiresIn, refreshToken: newRefreshToken };
  }

  async getHouseholds(): Promise<HouseholdsResponse> {
    const endpoint = `${SONOS_CONTROL_API}/households`;
    const response = await fetch(endpoint, {
      headers: [this.getBearerAuthorizationHeader()],
    });
    return await getSuccessfulResponseJson(response);
  }

  async getGroups(householdId: string): Promise<GroupsResponse> {
    const endpoint = `${SONOS_CONTROL_API}/households/${householdId}/groups`;
    const response = await fetch(endpoint, {
      headers: [this.getBearerAuthorizationHeader()],
    });
    return await getSuccessfulResponseJson(response);
  }

  async getPlayerVolume(playerId: string): Promise<PlayerVolume> {
    const endpoint = `${SONOS_CONTROL_API}/players/${playerId}/playerVolume`;
    const response = await fetch(endpoint, {
      headers: [this.getBearerAuthorizationHeader()],
    });
    return await getSuccessfulResponseJson(response);
  }

  async setPlayerVolume(
    playerId: string,
    volume: number,
    muted?: boolean
  ): Promise<PlayerVolume> {
    const endpoint = `${SONOS_CONTROL_API}/players/${playerId}/playerVolume`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBearerAuthorizationHeader(), CONTENT_TYPE_JSON_HEADER],
      body: JSON.stringify({ volume, muted }),
    });
    return await getSuccessfulResponseJson(response);
  }

  async setPlayerMute(playerId: string, muted: boolean): Promise<PlayerVolume> {
    const endpoint = `${SONOS_CONTROL_API}/players/${playerId}/playerVolume/mute`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBearerAuthorizationHeader(), CONTENT_TYPE_JSON_HEADER],
      body: JSON.stringify({ muted }),
    });
    return await getSuccessfulResponseJson(response);
  }

  private getBasicAuthorizationHeader(): [string, string] {
    const credentials = Buffer.from(
      `${this.clientKey}:${this.clientSecret}`
    ).toString("base64");

    return ["Authorization", `Basic ${credentials}`];
  }

  private getBearerAuthorizationHeader(): [string, string] {
    return ["Authorization", `Bearer ${this.accessToken}`];
  }
}

export class StatusCodeError extends Error {
  constructor(status: number) {
    super(`Status code: ${status}`);
  }
}

export interface RefreshTokenResponse {
  refreshToken: string;
  expiresIn: number;
}

export interface HouseholdsResponse {
  households: Household[];
}

export interface Household {
  id: string;
  name: string;
}

export interface GroupsResponse {
  groups: Group[];
  players: Player[];
  partial: boolean;
}

export interface Group {
  id: string;
  name: string;
  playbackState: PlaybackStatus;
  coordinatorId: string;
  playerIds: string[];
}

export interface Player {
  id: string;
  name: string;
  icon: string;
  websocketUrl: string;
  softwareVersion: string;
  apiVersion: string;
  minApiVersion: string;
  capabilities: Capability[];
  deviceIds: string[];
}

export interface PlayerVolume {
  volume: number;
  muted: boolean;
  fixed: boolean;
}

export const enum PlaybackStatus {
  Idle = "PLAYBACK_STATE_IDLE",
  Buffering = "PLAYBACK_STATE_BUFFERING",
  Playing = "PLAYBACK_STATE_PLAYING",
  Paused = "PLAYBACK_STATE_PAUSED",
}

export const enum Capability {
  Playback = "PLAYBACK",
  Cloud = "CLOUD",
  HtPlayback = "HT_PLAYBACK",
  HtPowerState = "HT_POWER_STATE",
  Airplay = "AIRPLAY",
  LineIn = "LINE_IN",
  AudioClip = "AUDIO_CLIP",
  Voice = "VOICE",
  SpeakerDetection = "SPEAKER_DETECTION",
  FixedVolume = "FIXED_VOLUME",
}

async function getSuccessfulResponseJson(response: Response) {
  if (response.status >= 400) {
    throw new StatusCodeError(response.status);
  }
  return await response.json();
}
