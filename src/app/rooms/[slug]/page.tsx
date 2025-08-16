interface RoomPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { slug } = await params;
  
  // Extract room ID from slug (last part after the last dash)
  const roomId = slug.split('-').pop();

  return (
    <div className="pt-20">
        {/* Page Header */}
        <div className="bg-white py-12">
          <div className="mx-auto w-[90%] max-w-[1200px]">
            <h1 className="text-[40px] sm:text-5xl font-bold text-black text-center mb-4">
              Room Details
            </h1>
            <p className="text-gray-600 text-center text-lg">
              Room ID: {roomId} | Slug: {slug}
            </p>
          </div>
        </div>
        
        {/* Room Details Content */}
        <div className="bg-white py-16">
          <div className="mx-auto w-[90%] max-w-[1200px]">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Single Room Page
              </h2>
              <p className="text-gray-600 mb-4">
                This is where the individual room details will be displayed.
              </p>
              <div className="bg-white rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-500">
                  <strong>Slug:</strong> {slug}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Room ID:</strong> {roomId}
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
