import { DynamicPlatform } from "@credding/homebridge-jsx";
import { API, Logging } from "homebridge";
import { PLATFORM_NAME, PLUGIN_IDENTIFIER } from "./settings";
import { SonosApi } from "./SonosApi";
import { SonosApiContext } from "./SonosApiContext";
import { SonosPlayer } from "./SonosPlayer";

interface SonosConfig {
  readonly clientKey: string;
  readonly clientSecret: string;
  readonly refreshToken: string;
}

export const SonosPlatform = async (
  logger: Logging,
  config: SonosConfig,
  api: API
) => {
  const sonosApi = new SonosApi(config.clientKey, config.clientSecret);
  await sonosApi.refreshToken(config.refreshToken);

  const { households } = await sonosApi.getHouseholds();
  const householdId = households[0].id;

  const { players } = await sonosApi.getGroups(householdId);

  return (
    <SonosApiContext.Provider value={sonosApi}>
      <DynamicPlatform
        pluginIdentifier={PLUGIN_IDENTIFIER}
        platformName={PLATFORM_NAME}
      >
        {players.map((player) => (
          <SonosPlayer {...player}></SonosPlayer>
        ))}
      </DynamicPlatform>
    </SonosApiContext.Provider>
  );
};
