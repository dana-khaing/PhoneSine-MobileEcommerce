export function productImageUrl(image, origin = "") {
  return image?.url ? `${origin}${image.url}` : "/iph15-pro.jpeg";
}
