import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const { data: session } = useSession();
  return (
    <header className="flex justify-between items-center p-4 bg-gray-100">
      <div>{session?.user?.name} ({session?.user?.email}) {session?.user?.image && <img src={session?.user?.image} alt="avatar" />}</div>
      <button onClick={() => signOut()}>Logout</button>
    </header>
  );
};

export default Header;