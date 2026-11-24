import { fetchFromAPI, getImageUrl } from '@/lib/api';
import MeetOurTeam from './MeetOurTeam';

async function getTeamData() {
  try {
    const [leadershipData, teamData] = await Promise.all([
      fetchFromAPI('/leadership/', { next: { revalidate: 10 } }),
      fetchFromAPI('/team-members/', { next: { revalidate:10 } }),
    ]);

    const leadershipRaw = Array.isArray(leadershipData)
      ? leadershipData[0]
      : leadershipData?.results?.[0] || null;

    const leadership = leadershipRaw
      ? {
          _id: leadershipRaw.id,
          name: leadershipRaw.name,
          role: leadershipRaw.role,
          bio: leadershipRaw.bio || '',
          image: getImageUrl(leadershipRaw.image),
        }
      : null;

    const members = Array.isArray(teamData)
      ? teamData
      : teamData?.results || [];

    const teamMembers = members.map((member) => ({
      _id: member.id,
      name: member.name,
      role: member.role,
      bio: member.bio || '',
      department: member.department || '',
      image: member.image
        ? {
            src: getImageUrl(member.image),
            alt: member.name,
          }
        : null,
    }));

    return {
      leadership,
      teamMembers,
    };
  } catch (error) {
    console.error('ERROR:', error);

    return {
      leadership: null,
      teamMembers: [],
    };
  }
}
export default async function MeetOurTeamServer() {
  const data = await getTeamData();

  return (
    <MeetOurTeam
      leadership={data.leadership}
      teamMembers={data.teamMembers}
    />
  );
}
