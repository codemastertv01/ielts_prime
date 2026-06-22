'use client';

const GradingQueue = () => {
    // const { pendingGrading, isLoading, gradeWriting, gradeSpeaking, isGrading } = useGrading()
    // const [selectedAttempt, setSelectedAttempt] = useState(null)
    // const [gradingType, setGradingType] = useState(null)
    // const [scores, setScores] = useState({
    //     taskAchievement: 0,
    //     coherenceCohesion: 0,
    //     lexicalResource: 0,
    //     grammaticalRange: 0,
    //     fluencyCoherence: 0,
    //     pronunciation: 0,
    //     taskNumber: 1,
    //     partNumber: 1,
    //     feedback: '',
    // })
    // const handleGradeWriting = () => {
    //     if (!selectedAttempt) return
    //     const data = {
    //         attemptId: selectedAttempt._id,
    //         taskNumber: scores.taskNumber,
    //         taskAchievement: scores.taskAchievement,
    //         coherenceCohesion: scores.coherenceCohesion,
    //         lexicalResource: scores.lexicalResource,
    //         grammaticalRange: scores.grammaticalRange,
    //         feedback: scores.feedback,
    //     }
    //     gradeWriting(data)
    //     closeModal()
    // }
    // const handleGradeSpeaking = () => {
    //     if (!selectedAttempt) return
    //     const data = {
    //         attemptId: selectedAttempt._id,
    //         partNumber: scores.partNumber,
    //         fluencyCoherence: scores.fluencyCoherence,
    //         lexicalResource: scores.lexicalResource,
    //         grammaticalRange: scores.grammaticalRange,
    //         pronunciation: scores.pronunciation,
    //         feedback: scores.feedback,
    //     }
    //     gradeSpeaking(data)
    //     closeModal()
    // }
    // const openGradingModal = (attempt, type) => {
    //     setSelectedAttempt(attempt)
    //     setGradingType(type)
    //     setScores({
    //         taskAchievement: 0,
    //         coherenceCohesion: 0,
    //         lexicalResource: 0,
    //         grammaticalRange: 0,
    //         fluencyCoherence: 0,
    //         pronunciation: 0,
    //         taskNumber: 1,
    //         partNumber: 1,
    //         feedback: '',
    //     })
    // }
    // const closeModal = () => {
    //     setSelectedAttempt(null)
    //     setGradingType(null)
    // }
    // const renderScoreInput = (label, field, value) => (
    //     <div>
    //         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    //             {label}
    //         </label>
    //         <input type="number" min="0" max="9" step="0.5" value={value} onChange={(e) => setScores({ ...scores, [field]: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
    //     </div>
    // )
    // if (isLoading) {
    //     return (
    //         <div className="flex items-center justify-center h-screen">
    //             <div className="text-xl">Loading grading queue...</div>
    //         </div>
    //     )
    // }
    // return (
    //     <div className="p-6 space-y-6">
    //         <div>
    //             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grading Queue</h1>
    //             <p className="text-gray-600 dark:text-gray-400 mt-2">
    //                 Review and grade pending writing and speaking submissions
    //             </p>
    //         </div>
    //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
    //                 <div className="flex items-center gap-3">
    //                     <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
    //                         <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
    //                     </div>
    //                     <div>
    //                         <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
    //                         <p className="text-2xl font-bold text-gray-900 dark:text-white">
    //                             {pendingGrading.length}
    //                         </p>
    //                     </div>
    //                 </div>
    //             </div>
    //             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
    //                 <div className="flex items-center gap-3">
    //                     <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
    //                         <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    //                     </div>
    //                     <div>
    //                         <p className="text-sm text-gray-600 dark:text-gray-400">Writing</p>
    //                         <p className="text-2xl font-bold text-gray-900 dark:text-white">
    //                             {pendingGrading.filter((a) => a.writingAnswers?.length > 0).length}
    //                         </p>
    //                     </div>
    //                 </div>
    //             </div>
    //             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
    //                 <div className="flex items-center gap-3">
    //                     <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
    //                         <Mic className="w-6 h-6 text-purple-600 dark:text-purple-400" />
    //                     </div>
    //                     <div>
    //                         <p className="text-sm text-gray-600 dark:text-gray-400">Speaking</p>
    //                         <p className="text-2xl font-bold text-gray-900 dark:text-white">
    //                             {pendingGrading.filter((a) => a.speakingAnswers?.length > 0).length}
    //                         </p>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //         {pendingGrading.length === 0 ? (
    //             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
    //                 <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
    //                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
    //                     All Caught Up!
    //                 </h3>
    //                 <p className="text-gray-600 dark:text-gray-400">
    //                     There are no pending submissions to grade at the moment.
    //                 </p>
    //             </div>
    //         ) : (
    //             <div className="grid grid-cols-1 gap-4">
    //                 {pendingGrading.map((attempt, index) => (
    //                     <motion.div key={attempt._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    //                         <div className="flex items-start justify-between mb-4">
    //                             <div className="flex items-start gap-4">
    //                                 <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
    //                                     <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    //                                 </div>
    //                                 <div>
    //                                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
    //                                         Attempt #{attempt.attemptNumber}
    //                                     </h3>
    //                                     <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
    //                                         <span className="flex items-center gap-1">
    //                                             <User className="w-4 h-4" />
    //                                             User ID: {attempt.userId}
    //                                         </span>
    //                                         <span className="flex items-center gap-1">
    //                                             <Calendar className="w-4 h-4" />
    //                                             {new Date(attempt.startedAt).toLocaleDateString()}
    //                                         </span>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                             <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-medium">
    //                                 {attempt.status}
    //                             </span>
    //                         </div>
    //                         <div className="flex gap-3">
    //                             {attempt.writingAnswers?.length > 0 && (
    //                                 <button onClick={() => openGradingModal(attempt, 'writing')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
    //                                     <FileText className="w-5 h-5" />
    //                                     Grade Writing ({attempt.writingAnswers.length})
    //                                 </button>
    //                             )}
    //                             {attempt.speakingAnswers?.length > 0 && (
    //                                 <button onClick={() => openGradingModal(attempt, 'speaking')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
    //                                     <Mic className="w-5 h-5" />
    //                                     Grade Speaking ({attempt.speakingAnswers.length})
    //                                 </button>
    //                             )}
    //                         </div>
    //                     </motion.div>
    //                 ))}
    //             </div>
    //         )}
    //         {selectedAttempt && gradingType && (
    //             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    //                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    //                     <div className="p-6 border-b border-gray-200 dark:border-gray-700">
    //                         <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
    //                             Grade {gradingType === 'writing' ? 'Writing' : 'Speaking'}
    //                         </h3>
    //                     </div>
    //                     <div className="p-6 space-y-4">
    //                         {gradingType === 'writing' ? (
    //                             <>
    //                                 <div>
    //                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    //                                         Task Number
    //                                     </label>
    //                                     <select value={scores.taskNumber} onChange={(e) => setScores({ ...scores, taskNumber: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
    //                                         <option value={1}>Task 1</option>
    //                                         <option value={2}>Task 2</option>
    //                                     </select>
    //                                 </div>
    //                                 {renderScoreInput('Task Achievement', 'taskAchievement', scores.taskAchievement)}
    //                                 {renderScoreInput('Coherence & Cohesion', 'coherenceCohesion', scores.coherenceCohesion)}
    //                                 {renderScoreInput('Lexical Resource', 'lexicalResource', scores.lexicalResource)}
    //                                 {renderScoreInput('Grammatical Range', 'grammaticalRange', scores.grammaticalRange)}
    //                             </>
    //                         ) : (
    //                             <>
    //                                 <div>
    //                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    //                                         Part Number
    //                                     </label>
    //                                     <select value={scores.partNumber} onChange={(e) => setScores({ ...scores, partNumber: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
    //                                         <option value={1}>Part 1</option>
    //                                         <option value={2}>Part 2</option>
    //                                         <option value={3}>Part 3</option>
    //                                     </select>
    //                                 </div>
    //                                 {renderScoreInput('Fluency & Coherence', 'fluencyCoherence', scores.fluencyCoherence)}
    //                                 {renderScoreInput('Lexical Resource', 'lexicalResource', scores.lexicalResource)}
    //                                 {renderScoreInput('Grammatical Range', 'grammaticalRange', scores.grammaticalRange)}
    //                                 {renderScoreInput('Pronunciation', 'pronunciation', scores.pronunciation)}
    //                             </>
    //                         )}
    //                         <div>
    //                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    //                                 Feedback
    //                             </label>
    //                             <textarea value={scores.feedback} onChange={(e) => setScores({ ...scores, feedback: e.target.value })} rows={4} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Provide detailed feedback..." />
    //                         </div>
    //                     </div>
    //                     <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
    //                         <button onClick={closeModal} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
    //                             Cancel
    //                         </button>
    //                         <button onClick={gradingType === 'writing' ? handleGradeWriting : handleGradeSpeaking} disabled={isGrading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
    //                             {isGrading ? 'Grading...' : 'Submit Grade'}
    //                         </button>
    //                     </div>
    //                 </motion.div>
    //             </div>
    //         )}
    //     </div>
    // )
};

export default GradingQueue;
