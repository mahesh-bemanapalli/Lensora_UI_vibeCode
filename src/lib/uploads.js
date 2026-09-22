import api from "./api";

export async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/admin/media/images", form);
  return data;
}
