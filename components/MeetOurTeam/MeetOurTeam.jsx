'use client';

import Image from 'next/image';

const getImageUrl = (image) => {
  if (!image) return null;
  if (typeof image === 'string') return image;
  if (typeof image.src === 'string') return image.src;
  if (typeof image.asset?.url === 'string') return image.asset.url;
  return null;
};

export default function MeetOurTeam({ leadership, teamMembers }) {
  const leader = leadership || null;
  const team = Array.isArray(teamMembers) ? teamMembers : [];
  const leaderImageUrl = getImageUrl(leader?.image);
  console.log(teamMembers)


  return (
    <section className="min-h-screen bg-[#101828] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center pb-10 lg:pb-0">
          <div className=" px-10 py-4 shadow-xl">
            <h2 className="text-3xl font-bold text-center text-white ">
              OUR TEAM MEMBERS
            </h2>
            <p className="text-center tracking-wide text-cyan-600 font-bold mt-1">
              MEET OUR TEAM
            </p>
          </div>
        </div>

        <div className="pb-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10">
            

            <div className="flex justify-center items-center">
              <Image
                src="/MaiLogo.png"
                alt="El Motahida Logo"
                width={500}
                
                height={500}
                
              />
            </div>
            <div className="bg-gray rounded-2xl overflow-hidden shadow-xl w-full md:w-125">
              <div className="relative h-80 flex items-center justify-center bg-white/30 p-8">
                  <div className="relative w-52 h-52 rounded-full border-8 border-white/30 overflow-hidden shadow-2xl">
                    {leaderImageUrl ? (
                      <Image
                        src={leaderImageUrl}
                        width={400}
                        unoptimized
                        height={400}
                        alt={leader.name || 'Team Member'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-white text-4xl font-bold">
                        {leader?.name?.charAt(0) || 'T'}
                      </div>
                    )}
                  </div>
                </div>

              <div className="bg-white text-center py-6">
                <h3 className="text-black text-2xl font-semibold mb-2">
                  {leader?.name || 'Chairman'}
                </h3>
                <p className="text-cyan-800 text-lg font-bold mb-4">
                  {leader?.role || 'Founder'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {team.map((member, index) => {
            const imageUrl = getImageUrl(member.image);

            return (
              <div
                key={member._id || member.id || index}
                className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden hover:scale-103 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="relative h-80 flex items-center justify-center bg-white/30 p-8">
                  <div className="relative w-52 h-52 rounded-full border-8 border-white/30 overflow-hidden shadow-2xl">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        width={200}
                        unoptimized
                        height={200}
                        alt={member.name || 'Team Member'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-white text-4xl font-bold">
                        {member.name?.charAt(0) || 'T'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 text-center rounded-b-3xl">
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">
                    {member.name || 'Unknown'}
                  </h3>
                  <p className="text-cyan-700 text-lg font-bold mb-2">
                    {member.role || 'Team Member'}
                  </p>

                  

                  
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
