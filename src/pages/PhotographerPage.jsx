import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { usePhotographerSite } from "../website/hooks/usePhotographerSite";
import { useBookingInquiry } from "../website/hooks/useBookingInquiry";
import { resolveWebsiteTemplate } from "../website/templates/registry";
import { TemplatePreview } from "../website/components/TemplatePreview";

export function PhotographerPage({ preview = false }) {
  const { slug, categorySlug } = useParams();
  // Clear the previous photographer's content and inquiry state when the slug changes.
  return <PhotographerWebsite key={`${slug}-${preview}`} slug={slug} categorySlug={categorySlug} preview={preview} />;
}

function PhotographerWebsite({ slug, categorySlug, preview }) {
  const site = usePhotographerSite(slug, categorySlug, preview);
  const booking = useBookingInquiry(slug);
  const location = useLocation();
  const previewKey = preview ? new URLSearchParams(location.search).get("template") : null;
  const template = resolveWebsiteTemplate(previewKey ?? site.profile?.templateKey);
  const Template = template.component;
  const linkSearch = preview ? `?template=${template.key}` : "";
  useEffect(() => {
    if (site.status !== "ready" || template.key !== "minimal-gallery") return undefined;
    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        // Section IDs are controlled by the templates, with no URL decoding needed.
        document.getElementById(location.hash.slice(1))?.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, site.status, template.key]);

  if (site.status === "loading") return <main className="state">Loading portfolio…</main>;
  if (site.status === "forbidden") return <main className="state">SuperAdmin access is required. Sign in again if your role changed.</main>;
  if (site.status === "missing") {
    return <main className="state">This photographer could not be found.</main>;
  }
  return <>
    {preview && <TemplatePreview slug={slug} photographerName={site.profile.name} templateKey={template.key} savedKey={site.profile.templateKey} />}
    <Template site={{ ...site, slug: preview ? `platform/photographers/${slug}/preview` : slug, linkSearch }} booking={preview ? {
      ...booking, submitBooking: event => event.preventDefault(),
      bookingStatus: "booking-error", bookingError: "Preview only. Inquiries cannot be sent from this page.",
    } : booking} />
  </>;
}
