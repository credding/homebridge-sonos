import {
  BaseDynamicPlatform,
  DynamicPlatformConfiguration,
  PlatformConfig,
} from "@credding/homebridge-util";
import { API, Categories, Logging } from "homebridge";
import { SonosPlayerAccessory } from "./accessories";
import { PLUGIN_NAME } from "./settings";
import { SonosApi } from "./SonosApi";

interface SonosConfig {
  readonly clientKey: string;
  readonly clientSecret: string;
  readonly refreshToken: string;
}

export class SonosPlatform extends BaseDynamicPlatform<SonosConfig> {
  private readonly sonosApi: SonosApi;
  private tokenRefreshTimer: NodeJS.Timeout | undefined;

  constructor(logger: Logging, config: PlatformConfig<SonosConfig>, api: API) {
    super(PLUGIN_NAME, logger, config, api);
    this.sonosApi = new SonosApi(config.clientKey!, config.clientSecret!);
  }

  async configurePlatform(
    platform: DynamicPlatformConfiguration
  ): Promise<void> {
    await this.tokenRefresh();

    const { households } = await this.sonosApi.getHouseholds();
    const householdId = households[0].id;

    const { players } = await this.sonosApi.getGroups(householdId);

    for (const player of players) {
      const uuid = this.api.hap.uuid.generate(player.id);

      platform.addAccessory(
        player.name,
        uuid,
        Categories.SPEAKER,
        new SonosPlayerAccessory(this.sonosApi, player, this.api)
      );
    }
  }

  private async tokenRefresh(): Promise<void> {
    if (typeof this.tokenRefreshTimer !== undefined) {
      clearTimeout(this.tokenRefreshTimer!);
    }
    const { expiresIn } = await this.sonosApi.refreshToken(
      this.config.refreshToken!
    );
    this.tokenRefreshTimer = setTimeout(() => {
      this.tokenRefresh();
    }, (expiresIn - 3600) * 1000);
  }
}
