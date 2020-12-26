import {
  BooleanCharacteristic,
  Component,
  NumberCharacteristic,
  PlatformAccessory,
  PlatformAccessoryConfiguration,
  Service,
  useContext,
  useHomebridgeApi,
} from "@credding/homebridge-jsx";
import { Categories } from "homebridge";
import { SonosApiContext } from "./SonosApiContext";

type SonosSpeakerProps = {
  id: string;
  name: string;
};

export const SonosPlayer = ({
  id,
  name,
}: SonosSpeakerProps): Component<PlatformAccessoryConfiguration> => {
  const { hap } = useHomebridgeApi();
  const sonosApi = useContext(SonosApiContext);

  const getMuted = async () => {
    const { muted } = await sonosApi.getPlayerVolume(id);
    return muted;
  };
  const setMuted = async (value: boolean) => {
    await sonosApi.setPlayerMute(id, value);
  };

  const getVolume = async () => {
    const { volume } = await sonosApi.getPlayerVolume(id);
    return volume;
  };
  const setVolume = async (value: number) => {
    await sonosApi.setPlayerVolume(id, value);
  };

  return (
    <PlatformAccessory
      name={name}
      uuid={hap.uuid.generate(id)}
      category={Categories.SPEAKER}
    >
      <Service type={hap.Service.Speaker}>
        <BooleanCharacteristic
          type={hap.Characteristic.Mute}
          onGet={getMuted}
          onSet={setMuted}
        ></BooleanCharacteristic>
        <NumberCharacteristic
          type={hap.Characteristic.Volume}
          onGet={getVolume}
          onSet={setVolume}
        ></NumberCharacteristic>
      </Service>
    </PlatformAccessory>
  );
};
