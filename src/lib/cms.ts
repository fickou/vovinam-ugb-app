import { supabase } from '../integrations/supabase/client';
import { SiteSettings, GalleryImage } from '../types/cms';

/**
 * Service pour gérer le contenu dynamique du site web (CMS)
 */
export const cmsApi = {

    // --- SETTINGS (Textes et config) ---
    async getSettings<K extends keyof SiteSettings>(sectionKey: K): Promise<SiteSettings[K] | null> {
        const { data, error } = await supabase
            .from('site_settings')
            .select('content')
            .eq('section_key', sectionKey)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore "Row not found"
            console.error(`Erreur chargement ${sectionKey}:`, error);
        }
        return data?.content as SiteSettings[K] || null;
    },

    async updateSettings<K extends keyof SiteSettings>(sectionKey: K, content: SiteSettings[K]) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({
                section_key: sectionKey,
                content: content
            });

        if (error) throw error;
    },

    // --- GALLERY (Images) ---
    async getGallery(): Promise<GalleryImage[]> {
        const { data, error } = await supabase
            .from('public_gallery')
            .select('*')
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;
        // Map database columns to interface properties
        return (data || []).map(img => ({
            id: img.id,
            src: img.image_url,
            label: img.label,
            cat: img.category,
            order_index: img.order_index,
            created_at: img.created_at
        }));
    },

    async addGalleryImage(image: Omit<GalleryImage, 'id' | 'created_at'>) {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from('public_gallery')
            .insert([{ 
                image_url: image.src,
                label: image.label,
                category: image.cat,
                created_by: user?.id 
            }]);
        if (error) throw error;
    },

    async updateGalleryImage(id: string, updates: Partial<GalleryImage>) {
        // Map interface properties to database columns
        const dbUpdates: any = {};
        if (updates.src !== undefined) dbUpdates.image_url = updates.src;
        if (updates.label !== undefined) dbUpdates.label = updates.label;
        if (updates.cat !== undefined) dbUpdates.category = updates.cat;
        if (updates.order_index !== undefined) dbUpdates.order_index = updates.order_index;

        const { error } = await supabase
            .from('public_gallery')
            .update(dbUpdates)
            .eq('id', id);
        if (error) throw error;
    },

    async deleteGalleryImage(id: string, imageUrl: string) {
        // 1. Delete from storage if it's a Supabase storage URL
        if (imageUrl.includes('supabase.co')) {
            const path = imageUrl.split('public-assets/')[1];
            if (path) {
                await supabase.storage.from('public-assets').remove([path]);
            }
        }

        // 2. Delete from DB
        const { error } = await supabase
            .from('public_gallery')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- STORAGE (Upload media pour hero/about) ---
    async uploadAsset(file: File, folder: string = 'general'): Promise<string> {
        const ext = file.name.split('.').pop();
        const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`;

        const { error, data } = await supabase.storage
            .from('public-assets')
            .upload(fileName, file, { upsert: true });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('public-assets')
            .getPublicUrl(data.path);

        return publicUrl;
    },

    // --- EVENTS (Événements) ---
    async getEvents(): Promise<any[]> {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    async getEvent(id: string): Promise<any> {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async createEvent(event: Omit<any, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('events')
            .insert([{ ...event, created_by: user?.id }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateEvent(id: string, updates: Partial<any>) {
        const { error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    },

    async deleteEvent(id: string) {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- EVENT IMAGES ---
    async getEventImages(eventId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('event_images')
            .select('*')
            .eq('event_id', eventId)
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async addEventImage(eventId: string, image: Omit<any, 'id' | 'created_at' | 'event_id' | 'created_by'>) {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from('event_images')
            .insert([{ event_id: eventId, ...image, created_by: user?.id }]);
        if (error) throw error;
    },

    async addEventImages(eventId: string, images: Array<Omit<any, 'id' | 'created_at' | 'event_id' | 'created_by'>>) {
        const { data: { user } } = await supabase.auth.getUser();
        const imagesToInsert = images.map(img => ({ 
            event_id: eventId, 
            ...img, 
            created_by: user?.id 
        }));
        const { error } = await supabase
            .from('event_images')
            .insert(imagesToInsert);
        if (error) throw error;
    },

    async deleteEventImage(id: string, imageUrl: string) {
        // 1. Delete from storage if it's a Supabase storage URL
        if (imageUrl.includes('supabase.co')) {
            const path = imageUrl.split('public-assets/')[1];
            if (path) {
                await supabase.storage.from('public-assets').remove([path]);
            }
        }

        // 2. Delete from DB
        const { error } = await supabase
            .from('event_images')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
