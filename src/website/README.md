# Public website templates

The existing public design is Template 1: `templates/EditorialTemplate.jsx`.
Both `/:slug` and `/:slug/portfolio/:categorySlug` still enter through
`src/pages/PhotographerPage.jsx`.

- `hooks/usePhotographerSite.js` loads the photographer and prepares category
  selection, portfolio items, the hero image, and empty content lists.
- `hooks/useBookingInquiry.js` owns package selection, inquiry submission,
  and success/error state, using the existing API contract.
- `components/BookingForm.jsx` renders the shared inquiry form.
- `components/PortfolioCategoryPage.jsx` preserves the existing category gallery.
- `templates/EditorialTemplate.jsx` composes the current public design from
  prepared content and booking actions. It makes no API calls.

Existing CSS stays in `src/styles.css` to preserve this design during extraction.
The dashboard, routes, authentication, and deployment setup remain in place.

Template 2 is `templates/MinimalGalleryTemplate.jsx`, with scoped styles in
`templates/minimal-gallery.css`. It accepts the same `site` and `booking` props
and reuses the booking hook and form. Its category pages retain the minimal layout.
Empty galleries have explicit messages; optional packages and gear are hidden
when absent. `templates/registry.js` registers stable keys and defaults unknown
keys to Editorial.

Public pages always use the saved template and ignore `?template=` parameters.
Visitors and photographers never see preview controls.

SuperAdmin signs in and opens `/platform/photographers`, then chooses
**Preview and assign design**. The protected preview route loads actual content
through `/api/platform/photographers/{slug}/preview`. Preview selection stays in
the URL, including category navigation; it does not update the live profile.
Only **Assign design** persists a selection. Inquiry submission is disabled in previews.

Photographer profiles show the assigned design and a View website link, with no
selector. The API rejects template changes through profile updates and non-default
template choices during photographer registration.
The preview controls float at the bottom right and can be minimized. Photographer
list preview/public links open in separate tabs. SuperAdmin can choose **Register
photographer** at `/platform/photographers/new`; the form uses the existing
`POST /api/auth/register` endpoint, always requests Editorial, and discards the
returned photographer token so the SuperAdmin session is preserved. Registration
errors remain on the form; success offers preview, public website, and register
another actions. No registration email is sent by this screen.
