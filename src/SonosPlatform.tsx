import {
  Component,
  DynamicPlatform,
  DynamicPlatformConfiguration,
} from "@credding/homebridge-jsx";
import { PLATFORM_NAME, PLUGIN_IDENTIFIER } from "./settings";
import { Player } from "./SonosApi";
import { SonosPlayer } from "./SonosPlayer";

type SonosPlatformProps = {
  players: Player[];
};

export const SonosPlatform = ({
  players,
}: SonosPlatformProps): Component<DynamicPlatformConfiguration> => (
  <DynamicPlatform
    pluginIdentifier={PLUGIN_IDENTIFIER}
    platformName={PLATFORM_NAME}
  >
    {players.map((player) => (
      <SonosPlayer {...player}></SonosPlayer>
    ))}
  </DynamicPlatform>
);
