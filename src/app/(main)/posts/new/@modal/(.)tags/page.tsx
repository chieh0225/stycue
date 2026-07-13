import { fetchInitialTagPickerData } from '@/lib/tag-server';
import TagPickerModalClient from './tag-picker-modal-client';

export default async function TagPickerModal() {
  const initialData = await fetchInitialTagPickerData();
  return <TagPickerModalClient initialData={initialData} />;
}
