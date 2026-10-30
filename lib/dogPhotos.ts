// Public URL of a file in the dog-photos bucket. Works on the server and in the browser.
export function photoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dog-photos/${path}`;
}

export const MAX_PHOTOS = 6;
