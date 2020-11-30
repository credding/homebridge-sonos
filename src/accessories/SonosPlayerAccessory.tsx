import {
  BasePlatformAccessory,
  PlatformAccessoryConfiguration,
} from "@credding/homebridge-util";
import { API } from "homebridge";
import { Player, SonosApi } from "../SonosApi";

export class SonosPlayerAccessory extends BasePlatformAccessory {
  constructor(
    private readonly sonosApi: SonosApi,
    private readonly player: Player,
    api: API
  ) {
    super(api);
  }

  async configureAccessory(
    accessory: PlatformAccessoryConfiguration
  ): Promise<void> {
    const speaker = accessory.addService(this.api.hap.Service.Speaker);

    speaker
      .addCharacteristic(this.api.hap.Characteristic.Mute)
      .addGetter(() => this.getPlayerMute())
      .addSetter((value: boolean) => this.setPlayerMute(value));

    speaker
      .addCharacteristic(this.api.hap.Characteristic.Volume)
      .addGetter(() => this.getPlayerVolume())
      .addSetter((value: number) => this.setPlayerVolume(value));
  }

  private async getPlayerMute(): Promise<boolean> {
    const { muted } = await this.sonosApi.getPlayerVolume(this.player.id);
    return muted;
  }

  private async setPlayerMute(value: boolean): Promise<void> {
    await this.sonosApi.setPlayerMute(this.player.id, value);
  }

  private async getPlayerVolume(): Promise<number> {
    const { volume } = await this.sonosApi.getPlayerVolume(this.player.id);
    return volume;
  }

  private async setPlayerVolume(value: number): Promise<void> {
    await this.sonosApi.setPlayerVolume(this.player.id, value, false);
  }
}
