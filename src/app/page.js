"use client";

import { useState } from "react";
// import { Ad } from "./components/Ad";
// // import CountUser from "./components/CountUser";
// // import Jackpot from "./components/Jackpot";
// // import SettingPage from "./components/SettingPage";
// import FloatingSettingsButton from "./components/FloatingSettingButton";

export default function Page() {
  const [isSettingPageOpen, setIsSettingPageOpen] = useState(false);

  const [adImages, setAdImages] = useState([
    {
      id: 1,
      src: "/images/ad.png",
      alt: "test",
      href: "https://www.google.com",
    },
    { id: 2, src: "/images/ad.png", alt: "Ad1" },
    { id: 3, src: "/images/banner.png", alt: "Banner1" },
    {
      id: 4,
      src: "/images/register.png",
      alt: "สมัครด้วยตัวเอง",
      href: "www.google.com",
    },
    {
      id: 5,
      src: "/images/line@.png",
      alt: "สมัครผ่านไลน์",
      href: "https://line.me/",
    },
    { id: 6, src: "/images/ad.png", alt: "Ad2" },
    { id: 7, src: "/images/ad.png", alt: "Ad3" },
  ]);

  const handleOpenSettingPage = () => {
    console.log("Modal Go!");
    setIsSettingPageOpen(true);
  };

  const handleSomthing = () => {
    console.log("something happened!");
  };
  const handleCloseSettingPage = () => {
    setIsSettingPageOpen(false);
  };

  const handleImageUpload = (newImageUrl) => {
    setAdImages((prevImages) =>
      prevImages.map((ad, index) => {
        index === 0 ? { ...ad, src: newImageUrl } : ad;
      })
    );
  };

  return (
    <div className="flex justify-center relative">
      <div className="justify-center bg-white/3 rounded-md h-fit w-full max-w-[400px] p-4 shadow-none backdrop-blur-md">
        {/* {adImages.map((ad) => (
          <Ad key={ad.id} href={ad.href} src={ad.src} alt={ad.alt} />
        ))}
        <CountUser />
        <Jackpot /> */}
        <div className="bg-black">Test</div>
      </div>
      {/* <SettingPage
        onOpen={handleOpenSettingPage}
        onClose={handleCloseSettingPage}
        isOpen={isSettingPageOpen}
        onImageUpload={handleImageUpload}
      />
      <FloatingSettingsButton handleClick={handleOpenSettingPage} /> */}
    </div>
  );
}
