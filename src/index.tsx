import { configureDynamicPlatform } from "@credding/homebridge-jsx";
import { API, Logging } from "homebridge";
import { PLATFORM_NAME } from "./settings";
import { SonosApi } from "./SonosApi";
import { SonosApiContext } from "./SonosApiContext";
import { SonosPlatform } from "./SonosPlatform";

type SonosConfig = {
  readonly clientKey: string;
  readonly clientSecret: string;
  readonly refreshToken: string;
};

const platformFactory = async (
  logger: Logging,
  { clientKey, clientSecret, refreshToken }: SonosConfig
) => {
  const sonosApi = new SonosApi(clientKey, clientSecret);
  await sonosApi.refreshToken(refreshToken);

  const { households } = await sonosApi.getHouseholds();
  const householdId = households[0].id;

  const { players } = await sonosApi.getGroups(householdId);

  return (
    <SonosApiContext.Provider value={sonosApi}>
      <SonosPlatform players={players}></SonosPlatform>
    </SonosApiContext.Provider>
  );
};

export default (api: API): void => {
  api.registerPlatform(
    PLATFORM_NAME,
    configureDynamicPlatform(platformFactory)
  );
};
