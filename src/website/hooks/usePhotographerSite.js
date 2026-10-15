import { useEffect, useState } from "react";
import api from "../../lib/api";

export function usePhotographerSite(slug, categorySlug, preview = false) {
  const [profile, setProfile] = useState();
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let active = true;
    api
      .get(preview ? `/platform/photographers/${slug}/preview` : `/photographers/${slug}`)
      .then(({ data }) => {
        if (active) {
          setProfile({ ...data, portfolio: data.portfolio ?? [], portfolioCategories: data.portfolioCategories ?? [], packages: data.packages ?? [], gear: data.gear ?? [] });
          setStatus("ready");
        }
      })
      .catch(error => active && setStatus(preview && [401, 403].includes(error.response?.status) ? "forbidden" : "missing"));
    return () => {
      active = false;
    };
  }, [slug, preview]);
  const selectedCategory = profile?.portfolioCategories?.find(
    (category) => category.slug === categorySlug,
  );
  const heroImage = profile?.profileImageUrl || profile?.portfolio?.[0]?.imageUrl;
  const portfolioItems = categorySlug
    ? selectedCategory
      ? (profile?.portfolio ?? []).filter(
          (item) =>
            item.category?.trim().toLocaleLowerCase() ===
            selectedCategory.name.trim().toLocaleLowerCase(),
        )
      : []
    : profile?.portfolio ?? [];

  return { status, profile, slug, categorySlug, selectedCategory, portfolioItems, heroImage };
}
