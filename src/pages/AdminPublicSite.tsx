import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyPlus, Save, LayoutTemplate, MessageCircle, FileImage, Image as ImageIcon, Calendar } from 'lucide-react';

import AdminHeroTab from '@/components/admin/cms/AdminHeroTab';
import AdminAboutTab from '@/components/admin/cms/AdminAboutTab';
import AdminPhilosophyTab from '@/components/admin/cms/AdminPhilosophyTab';
import AdminScheduleTab from '@/components/admin/cms/AdminScheduleTab';
import AdminContactTab from '@/components/admin/cms/AdminContactTab';
import AdminGalleryTab from '@/components/admin/cms/AdminGalleryTab';
import AdminEventsTab from '@/components/admin/cms/AdminEventsTab';

export default function AdminPublicSite() {
    const [activeTab, setActiveTab] = useState('hero');

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-display font-bold text-navy">Site Public (Visiteurs)</h1>
                    <p className="text-muted-foreground">
                        Ici, vous pouvez modifier tout le contenu affiché sur la page publique du club
                        susceptible d'être lu par les futurs adhérents et curieux.
                    </p>
                </div>

                {/* CMS Tabs */}
                <div className="w-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {/* Navigation Onglets */}
                        <div className="sticky top-14 z-20 bg-background/95 backdrop-blur py-4 border-b">
                            <TabsList className="w-full justify-start h-12 flex-wrap">
                                <TabsTrigger value="hero" className="flex items-center gap-2 px-4">
                                    <LayoutTemplate className="w-4 h-4" /> Accueil (Hero)
                                </TabsTrigger>
                                <TabsTrigger value="about" className="flex items-center gap-2 px-4">
                                    <CopyPlus className="w-4 h-4" /> Notre Histoire
                                </TabsTrigger>
                                <TabsTrigger value="philosophy" className="flex items-center gap-2 px-4">
                                    <MessageCircle className="w-4 h-4" /> Philosophie
                                </TabsTrigger>
                                <TabsTrigger value="schedule" className="flex items-center gap-2 px-4">
                                    <FileImage className="w-4 h-4" /> Déroulé Séances
                                </TabsTrigger>
                                <TabsTrigger value="contact" className="flex items-center gap-2 px-4">
                                    <MessageCircle className="w-4 h-4" /> Contact & FAQ
                                </TabsTrigger>
                                <TabsTrigger value="gallery" className="flex items-center gap-2 px-4">
                                    <ImageIcon className="w-4 h-4" /> Galerie Photo
                                </TabsTrigger>
                                <TabsTrigger value="events" className="flex items-center gap-2 px-4">
                                    <Calendar className="w-4 h-4" /> Événements
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Contenu des onglets - TODO */}
                        <div className="mt-8 bg-white p-6 rounded-xl border shadow-sm min-h-[500px]">
                            <TabsContent value="hero" className="m-0">
                                <AdminHeroTab />
                            </TabsContent>

                            <TabsContent value="about" className="m-0">
                                <AdminAboutTab />
                            </TabsContent>

                            <TabsContent value="philosophy" className="m-0">
                                <AdminPhilosophyTab />
                            </TabsContent>

                            <TabsContent value="schedule" className="m-0">
                                <AdminScheduleTab />
                            </TabsContent>

                            <TabsContent value="contact" className="m-0">
                                <AdminContactTab />
                            </TabsContent>

                            <TabsContent value="gallery" className="m-0">
                                <AdminGalleryTab />
                            </TabsContent>

                            <TabsContent value="events" className="m-0">
                                <AdminEventsTab />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </DashboardLayout>
    );
}
