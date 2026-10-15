import { AdminNav } from "../components/AdminNav";
import { MediaLibrary } from "../components/MediaLibrary";

export function MediaLibraryPage() {
  return <main className="dashboard"><AdminNav /><section className="manager media-manager"><p className="eyebrow dark">Your studio assets</p><h1>Media library</h1><p className="manager-intro">Keep your images, videos, audio and documents in one place, with storage usage and duplicate protection.</p><MediaLibrary /></section></main>;
}
