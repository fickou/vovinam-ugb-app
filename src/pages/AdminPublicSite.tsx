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
                <div className="flex flex-col gap-2 px-2 sm:px-0">
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-navy">Site Public (Visiteurs)</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Ici, vous pouvez modifier tout le contenu affiché sur la page publique du club
                        susceptible d'être lu par les futurs adhérents et curieux.
                    </p>
                </div>

                {/* CMS Tabs */}
                <div className="w-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {/* Navigation Onglets */}
                        <div className="sticky top-14 sm:top-16 z-20 bg-background/95 backdrop-blur py-3 sm:py-4 border-b overflow-x-auto">
                            <TabsList className="h-auto justify-start gap-1 sm:gap-2 flex-nowrap p-0 pl-2 sm:pl-0 bg-transparent">
                                <TabsTrigger value="hero" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                                    <LayoutTemplate className="w-4 h-4" />
                                    <span className="hidden sm:inline">Accueil (Hero)</span>
                                    <span className="sm:hidden text-xs">Accueil</span>
                                </TabsTrigger>
                                <TabsTrigger value="about" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                                    <CopyPlus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Notre Histoire</span>
                                    <span className="sm:hidden text-xs">Hist.</span>
                                </TabsTrigger>
                                <TabsTrigger value="philosophy" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="hidden sm:inline">Philosophie</span>
                                    <span className="sm:hidden text-xs">Philo.</span>
                                </TabsTrigger>
                                <TabsTrigger value="schedule" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                                    <FileImage className="w-4 h-4" />
                                    <span className="hidden sm:inline">Déroulé des Séances</span>
                                    <span className="sm:hidden text-xs">Séances</span>
                                </TabsTrigger>
                                <TabsTrigger value="contact" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="hidden sm:inline">Contact & FAQ</span>
                                    <span className="sm:hidden text-xs">Contact</span>
                                </TabsTrigger>
                                <TabsTrigger value="gallery" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                                    <ImageIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Galerie Photo</span>
                                    <span className="sm:hidden text-xs">Galerie</span>
                                </TabsTrigger>
                                <TabsTrigger value="events" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                                    <Calendar className="w-4 h-4" />
                                    <span className="hidden sm:inline">Événements</span>
                                    <span className="sm:hidden text-xs">Événements</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Contenu des onglets - TODO */}
                        <div className="mt-4 sm:mt-8 bg-white p-4 sm:p-6 rounded-xl border shadow-sm min-h-[300px] sm:min-h-[500px]">
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
