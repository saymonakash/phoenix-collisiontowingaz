import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Play, X } from "lucide-react";
import ad1 from "@/assets/images/ad1.mp4";
import ad2 from "@/assets/images/ad2.mp4";
import ad3 from "@/assets/images/ad3.mp4";
import ad4 from "@/assets/images/ad4.mp4";

import img1 from "@/assets/images/img1.jpg";
import img2 from "@/assets/images/img2.jpg";
import img3 from "@/assets/images/img3.jpg";
import { it } from "zod/v4/locales";

// Media items configuration
const mediaItems = [
  {
    id: 4,
    type: "video",
    src: ad2,
    // No thumbnail - will use video as thumbnail
    alt: "Ad Variation #2 ASU",
    className: "md:row-span-3",
  },
  {
    id: 1,
    type: "image",
    src: img1.src,
    alt: "Tow Truck #1",
    className: "md:col-span-2 md:row-span-3",
  },
  {
    id: 2,
    type: "video",
    src: ad1,
    thumbnail: img1.src, // Optional thumbnail
    alt: "Ad Variation #1 ASU",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: 3,
    type: "image",
    src: img2.src,
    alt: "Wide Shot Tow Truck #2",
    className: "md:col-span-1 md:row-span-2",
  },
  {
    id: 6,
    type: "image",
    src: img3.src,
    alt: "Wide Shot Tow Truck #3",
    className: "md:col-span-2 md:row-span-3",
  },
  {
    id: 5,
    type: "video",
    src: ad3,
    // No thumbnail - will use video as thumbnail
    alt: "Ad Variation #3 Collision Auto Body Shop",
    className: "md:col-span-1 md:row-span-3",
  },

  {
    id: 7,
    type: "video",
    src: ad4,
    // No thumbnail - will use video as thumbnail
    alt: "Ad Variation #4 Collision Auto Body Shop",
    className: "md:col-span-1 md:row-span-3",
  },
];

interface MediaItemProps {
  item: (typeof mediaItems)[0];
  onClick: () => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ item, onClick }) => {
  return (
    <div
      className={cn(
        `group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`,
        item.className,
      )}
      onClick={onClick}
    >
      {item.type === "image" ? (
        <img
          src={item.src}
          alt={item.alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <>
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.alt}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <video
              src={item.src}
              muted
              playsInline
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 group-hover:bg-black/20">
            <div className="rounded-full bg-white/90 p-4 transition-all duration-300 group-hover:bg-white group-hover:scale-110">
              <Play className="h-8 w-8 fill-current text-gray-800" />
            </div>
          </div>
        </>
      )}

      {/* Overlay with title */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="text-white font-medium text-sm">{item.alt}</p>
      </div>
    </div>
  );
};

interface MediaModalProps {
  item: (typeof mediaItems)[0] | null;
  isOpen: boolean;
  onClose: () => void;
}

const MediaModal: React.FC<MediaModalProps> = ({ item, isOpen, onClose }) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${item.type === "image" ? "max-w-[80vw] min-w-[80vw] h-[50vh] md:h-[80vh]" : "max-w-4xl w-full"} p-0 overflow-hidden`}
      >
        <div className="relative h-full">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>

          {item.type === "image" ? (
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              src={item.src}
              controls
              autoPlay
              className="w-full h-auto max-h-[80vh]"
            >
              Your browser does not support the video tag.
            </video>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h3 className="text-white font-semibold text-lg">{item.alt}</h3>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Gallery: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<
    (typeof mediaItems)[0] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = (item: (typeof mediaItems)[0]) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary dark:text-white mb-4">
            Our Work in Action
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Take a look at our professional towing services, state-of-the-art
            equipment, and collision repair work through our photo and video
            gallery.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[minmax(150px,1fr)] gap-4">
          {mediaItems.map((item) => (
            <MediaItem
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>

        {/* Modal */}
        <MediaModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </section>
  );
};

export default Gallery;
