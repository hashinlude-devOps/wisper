import React from "react";
import { Input, Button } from "antd";
import axios from "axios";

export default function SpeakerListToName({
  audioUploadFetched,
  setScript,
}: any) {
  const renderedSpeakers = new Set();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [inputData, setInputData] = React.useState();

  const handlePostRequest = async () => {
    const data = {
      json_path: `/home/silentguardian/Documents/Hashinclude/transcribeandtranscript/whisper-flask/${audioUploadFetched?.json_file}`,
      speaker_name_updates: inputData,
    };
    try {
      setIsLoading(true);
      const result = await axios.post(
        "http://192.168.70.112:5000/update-speaker-name",
        data
      );
      setScript(result?.data);
    } catch (error) {
      console.error("Error posting data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-[2rem]">
      {audioUploadFetched?.result?.map((item: any, index: number) => {
        if (item?.speaker && !renderedSpeakers.has(item?.speaker)) {
          renderedSpeakers.add(item?.speaker);

          return (
            <div
              key={index}
              className="md:flex justify-center items-center gap-[2rem] md:mt-[1rem] sm:mt-[2rem] mt-[2rem]"
            >
              <div>{item?.speaker}</div>
              <audio controls className="md:my-0 sm:my-[1rem] my-[1rem]">
                <source
                  src={`http://192.168.70.112:5000/${item?.segment_file}`}
                  type="audio/mpeg"
                />
                Your browser does not support the audio element.
              </audio>
              <Input
                placeholder="Enter name"
                className="md:w-[15rem]"
                onChange={(e) => {
                  setInputData((prev: any) => ({
                    ...prev,
                    [item?.speaker]: e.target.value,
                  }));
                }}
              />
            </div>
          );
        }
        return null;
      })}

      {audioUploadFetched?.length !== 0 && (
        <div className="flex justify-end items-center">
          <Button
            type="primary"
            loading={isLoading}
            className="bg-black"
            onClick={() => handlePostRequest()}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
