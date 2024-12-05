import React, { useEffect, useState, useRef } from "react";
import { getFullAudio } from "@/lib/services/audiofetchService"; // Adjust the path to your service file
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import CustomAudioPlayer from "./CustomAudioPlayer";
import Loader from "@/components/Loader";

interface AudioResultProps {
  result: {
    json_file: string;
    num_speakers: number;
    recording_id: number;
    result: {
      segment_file: string;
      speaker: string;
      transcribed_text: string;
      translated_text: string;
      start_time: number;
      end_time: number;
    }[];
    speaker_list: string[];
    status: string;
  };
}

const AudioResultComponent: React.FC<AudioResultProps> = ({ result }) => {
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(true);

  // A ref to track if the audio fetching has been performed already
  const hasFetchedAudio = useRef(false);

  // Helper function to format milliseconds to HH:mm:ss
  const formatTime = (ms: number) => {
    const date = new Date(ms * 1000); // Multiply by 1000 to convert to milliseconds
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  // Fetch the full audio URL on result change
  useEffect(() => {
    const fetchFullAudio = async () => {
      if (hasFetchedAudio.current) return; // Prevent fetching if it's already done

      setLoadingAudio(true); // Set loading state to true before fetching audio
      try {
        const url = await getFullAudio(result.recording_id.toString());
        setAudioUrl(url); // Set the audio URL once it's fetched
        hasFetchedAudio.current = true; // Mark that the audio has been fetched
      } catch (error) {
        console.error("Error fetching full audio:", error);
      } finally {
        setLoadingAudio(false); // Set loading state to false when finished
      }
    };

    // Reset state whenever result changes
    setAudioUrl(null); // Reset audio URL
    setLoadingAudio(true); // Reset loading state
    hasFetchedAudio.current = false; // Reset the fetch flag

    if (result.recording_id) {
      fetchFullAudio(); // Call the function to fetch the full audio
    }
  }, [result]); // Depend on result to fetch audio whenever result changes

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col space-y-4 px-[2rem] py-[2rem] flex-1">
        <h2 className="text-l">Audio Transcription and Translation Results</h2>

        <div className="mt-4">
          <h3 className="font-semibold">Segments</h3>
          <div className="space-y-2">
            {result.result.map((segment, index) => {
              const startTime = segment.start_time; // Start time in milliseconds
              const elapsedTime = formatTime(index === 0 ? 0 : startTime); // For first segment, always 00:00:00
              return (
                <div
                  key={index}
                  className="flex items-center space-x-4 hover:bg-gray-100 transition-colors duration-200 p-1 rounded-md"
                >
                  {/* Show the elapsed time relative to total audio */}
                  <div className="flex-1">
                    <span>{elapsedTime}</span>
                  </div>

                  {/* Dropdown Menu for Speakers */}
                  <div className="relative">
                    <div
                      className="flex items-center justify-center cursor-pointer bg-gray-200 w-6 h-6 rounded-full"
                      onClick={() =>
                        setOpenDropdownIndex(openDropdownIndex === index ? null : index)
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7 7 7-7" />
                      </svg>
                    </div>
                    {openDropdownIndex === index && (
                      <div className="absolute left-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-10 w-48">
                        <ul>
                          <li className="px-4 py-2 hover:bg-gray-100 border-b cursor-pointer">
                            Speakers
                          </li>
                          {result.speaker_list.map((speaker: string, speakerIndex: number) => (
                            <li
                              key={speakerIndex}
                              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer space-x-2"
                            >
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                className="flex-1 focus:border-gray-300 focus:outline-none rounded-md p-1"
                              >
                                {speaker}
                              </span>
                              <button className="text-gray-600 hover:text-gray-800 ml-auto">
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Speaker Name */}
                  <div className="flex-1">
                    <span>{segment.speaker}</span>
                  </div>

                  {/* Transcribed Text */}
                  <div className="flex-1">
                    <span>{segment.transcribed_text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Audio Player for Full Audio */}
      {loadingAudio ? (
        <Loader /> // Show the loader while the audio is being fetched
      ) : (
        audioUrl && (
          <div className="sticky bottom-0 w-full bg-white shadow-lg">
            <div className="max-w-full w-full ">
              {audioUrl && <CustomAudioPlayer audioUrl={audioUrl} />}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AudioResultComponent;
