const RESPONSIVE_WIDTHS = [400, 800, 1200, 1600, 2000];

function isCloudinaryUrl(source) {
  if (!source) return false;

  try {
    const url = new URL(source);
    return url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/");
  } catch {
    return false;
  }
}

export function cloudinaryImageUrl(source, width) {
  if (!isCloudinaryUrl(source)) return source;

  const url = new URL(source);
  url.pathname = url.pathname.replace(
    "/image/upload/",
    `/image/upload/c_limit,w_${width}/f_auto/q_auto/`,
  );
  return url.toString();
}

export function ResponsiveImage({
  src,
  alt = "",
  sizes = "100vw",
  widths = RESPONSIVE_WIDTHS,
  fallbackWidth = 1200,
  loading = "lazy",
  fetchPriority,
  ...imageProps
}) {
  const optimized = isCloudinaryUrl(src);
  const srcSet = optimized
    ? widths.map((width) => `${cloudinaryImageUrl(src, width)} ${width}w`).join(", ")
    : undefined;

  return (
    <img
      {...imageProps}
      src={optimized ? cloudinaryImageUrl(src, fallbackWidth) : src}
      srcSet={srcSet}
      sizes={optimized ? sizes : undefined}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
    />
  );
}
