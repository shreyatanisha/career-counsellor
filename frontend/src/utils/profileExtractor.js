/**
 * Extract structured profile data from raw intake answers.
 * Used as a fallback when the AI doesn't return structured data.
 */
export function extractProfileFromAnswers(answers) {
  const profile = {
    education: '',
    skills: [],
    interests: [],
    personality: '',
    constraints: { location: '', salary_min: '', timeline: '' },
    frustration: '',
    readiness_score: 5,
  }

  if (answers.length >= 1) profile.education = answers[0]
  if (answers.length >= 2) {
    const interests = answers[1].toLowerCase()
    if (interests.includes('coding') || interests.includes('programming')) profile.interests.push('programming')
    if (interests.includes('data')) profile.interests.push('data analysis')
    if (interests.includes('design')) profile.interests.push('design')
    if (interests.includes('manage')) profile.interests.push('management')
    if (interests.includes('teach')) profile.interests.push('teaching')
  }
  if (answers.length >= 4) {
    const env = answers[3].toLowerCase()
    if (env.includes('remote')) profile.personality = 'independent, self-motivated'
    else if (env.includes('team')) profile.personality = 'collaborative, social'
    else if (env.includes('solo')) profile.personality = 'focused, independent'
  }
  if (answers.length >= 5) {
    const constraints = answers[4].toLowerCase()
    if (constraints.includes('bangalore') || constraints.includes('bengaluru')) profile.constraints.location = 'Bangalore'
    if (constraints.includes('delhi')) profile.constraints.location = 'Delhi'
    if (constraints.includes('mumbai')) profile.constraints.location = 'Mumbai'
    if (constraints.includes('remote')) profile.constraints.location = 'Remote'
  }
  if (answers.length >= 6) profile.frustration = answers[5]

  return profile
}
