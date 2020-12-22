import {
  Accessory,
  BooleanCharacteristic,
  Categories,
  NumberCharacteristic,
  Service,
  useContext,
  useHomebridgeApi,
} from "@credding/homebridge-jsx";
import { SonosApiContext } from "./SonosApiContext";

interface SonosSpeakerProps {
  id: string;
  name: string;
}

export const SonosPlayer = async (props: SonosSpeakerProps) => {
  const { id, name } = props;
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
    <Accessory
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
    </Accessory>
  );
};
