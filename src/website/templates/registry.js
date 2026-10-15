import { EditorialTemplate } from "./EditorialTemplate";
import { MinimalGalleryTemplate } from "./MinimalGalleryTemplate";

export const websiteTemplates = [
  { key: "editorial", name: "Editorial", component: EditorialTemplate },
  { key: "minimal-gallery", name: "Minimal Gallery", component: MinimalGalleryTemplate },
];

export function resolveWebsiteTemplate(key) {
  return websiteTemplates.find(template => template.key === key) || websiteTemplates[0];
}
