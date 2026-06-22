import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attemptAPI } from '../services/attemptAPI';

export const useGrading = () => {
    const queryClient = useQueryClient();

    const { data: pendingGrading, isLoading } = useQuery({
        queryKey: ['grading', 'pending'],
        queryFn: async () => {
            const response = await attemptAPI.getAll({ status: 'in_progress' });
            return response;
        },
        refetchInterval: 30000,
    });

    const gradeWritingMutation = useMutation({
        // mutationFn: attemptAPI.gradeWriting,
        // onSuccess: () => {
        //     queryClient.invalidateQueries({ queryKey: ['grading'] })
        //     queryClient.invalidateQueries({ queryKey: ['attempts'] })
        //     showToast.success('Writing graded successfully!')
        // },
    });

    const gradeSpeakingMutation = useMutation({
        // mutationFn: attemptAPI.gradeSpeaking,
        // onSuccess: () => {
        //     queryClient.invalidateQueries({ queryKey: ['grading'] })
        //     queryClient.invalidateQueries({ queryKey: ['attempts'] })
        //     showToast.success('Speaking graded successfully!')
        // },
    });

    return {
        pendingGrading: pendingGrading?.attempts || [],
        isLoading,
        gradeWriting: gradeWritingMutation.mutate,
        gradeSpeaking: gradeSpeakingMutation.mutate,
        isGrading: gradeWritingMutation.isPending || gradeSpeakingMutation.isPending,
    };
};
