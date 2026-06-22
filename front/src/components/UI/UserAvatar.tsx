import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { AuthUser } from '../../types/auth';

interface UserAvatarProps {
    user: AuthUser | null
    size: 'sm' | 'md' | 'lg' | 'xl'
}


const UserAvatar = ({ user, size = 'md' }: UserAvatarProps) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
    };

    return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`${sizes[size]} rounded-full bg-linear-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold ${textSizes[size]}`} >
            {
                user?.avatarUrl ? <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full rounded-full object-cover" /> : user?.firstName ? user.firstName.charAt(0).toUpperCase() : <User className="w-1/2 h-1/2" />
            }
        </motion.div>
    );
};

export default UserAvatar;
