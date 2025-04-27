"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { avatarImages } from "@/constants";
import { useToast } from "./ui/use-toast";
import { useState } from "react"; // 👈 ADD this import
import axios from "axios";


interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  isRecording?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  isRecording,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
}: MeetingCardProps) => {
  const { toast } = useToast();

  // 👇 Add these states for controlling button text
  const [transcriptButtonText, setTranscriptButtonText] = useState("Transcript");
  const [summaryButtonText, setSummaryButtonText] = useState("Summary");

  const [transcriptUrl, setTranscriptUrl] = useState("");
  const [summaryUrl, setSummaryUrl] = useState("");

  // 👇 Empty function handlers (will fill logic later)
  const handleTranscriptClick = async () => {
    if (transcriptButtonText === "Download" && transcriptUrl) {
      window.open(transcriptUrl, "_blank");
      return;
    }
  
    setTranscriptButtonText("Processing...");
  
    try {
      const response = await axios.post("https://meeting-processing-server.onrender.com/api/transcript", {
        url: link},
        {
          headers: {
            "Content-Type": "application/json",
          },
      });
  
      console.log("Transcript Response:", response.data); // 👈 important
  
      if (response.data.success) {
        setTranscriptUrl(response.data.downloadUrl);
        setTranscriptButtonText("Download");
      } else {
        setTranscriptButtonText("Failed");
      }
    } catch (error) {
      console.error("Transcript error:", error);
      setTranscriptButtonText("Failed");
    }
  };

  const handleSummaryClick = async () => {
    if (summaryButtonText === "Download" && summaryUrl) {
      window.open(summaryUrl, "_blank");
      return;
    }
  
    setSummaryButtonText("Processing...");
  
    try {
      const response = await fetch("https://meeting-processing-server.onrender.com/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link }), // Using the meeting link
      });
  
      const data = await response.json();
  
      if (data.success) {
        setSummaryUrl(data.downloadUrl);
        setSummaryButtonText("Download");
      } else {
        setSummaryButtonText("Failed");
      }
    } catch (error) {
      console.error("Summary error:", error);
      setSummaryButtonText("Failed");
    }
  };

  return (
    <section className="flex min-h-[258px] w-full flex-col justify-between rounded-[14px] bg-dark-1 px-5 py-8 xl:max-w-[568px]">
      <article className="flex flex-col gap-5">
        <Image src={icon} alt="upcoming" width={28} height={28} />
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-base font-normal">{date}</p>
          </div>
        </div>
      </article>

      <article className={cn("flex justify-center relative", {})}>
        

        {!isPreviousMeeting && (
          <div className="flex gap-2">
            <Button onClick={handleClick} className="rounded bg-blue-1 px-6">
              {buttonIcon1 && (
                <Image src={buttonIcon1} alt="feature" width={20} height={20} />
              )}
              &nbsp; {buttonText}
            </Button>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({
                  title: "Link Copied",
                });
              }}
              className="bg-dark-4 px-6"
            >
              <Image
                src="/icons/copy.svg"
                alt="feature"
                width={20}
                height={20}
              />
              &nbsp; Copy Link
            </Button>

            {/* 👇 Transcript Button */}
            <Button onClick={handleTranscriptClick} className="bg-dark-4 px-6">
              {transcriptButtonText}
            </Button>

            {/* 👇 Summary Button */}
            <Button onClick={handleSummaryClick} className="bg-dark-4 px-6">
              {summaryButtonText}
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
