const redirectUrl = "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF5XhpeLTcfaoN6MFY3SOHdb7Y8cce9hneAVViR95gmifQ-MHn74lyw-ohW3qebNud4NB-XyO2Qq0kI6UF-yorj0uUvONWvCYtBbUjlS53Jksrt918NXUuCpQ4ui1fM4Xrs5xc_vaf0hlTyMiF4lMs_Eo5Q4KN3NsajkGLXBP5-wX8uE76M9w==";

async function check() {
  const res = await fetch(redirectUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    },
    redirect: 'follow'
  });
  console.log('Final URL:', res.url);
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Length:', text.length);
  // Look for image urls
  const imgs = text.match(/https?:\/\/[^"'\s]+\.(?:png|jpg|jpeg|webp)/gi) || [];
  console.log('Image URLs found on page:', [...new Set(imgs)].slice(0, 10));
}

check().catch(console.error);
