export async function GET() {
  const banners = [
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
  ];
  return Response.json({
    message: "Hello !",
    data: banners,
  });
}
