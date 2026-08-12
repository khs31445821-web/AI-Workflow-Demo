function compact(text, max = 150) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

export function generateMockContent(intake) {
  const occasion = intake.occasion || '감사';
  const recipient = intake.recipient || '소중한 사람';
  const sender = intake.sender || '보내는 사람';
  const story = compact(intake.story, 180);

  const directionMap = {
    '축하, 생일': 'bright contemporary pop',
    '감사, 추억': 'warm acoustic ballad',
    '프로포즈, 기념일, 사랑고백': 'romantic indie pop'
  };

  const selectedGenre = directionMap[occasion] || 'warm contemporary pop';

  return {
    title: `${recipient}에게 전하는 오늘의 노래`,
    selectedGenre,
    lyrics: `[Verse 1]\n${recipient}에게 닿기를 바란 마음\n평범했던 하루도 오래 기억되길\n\n[Verse 2]\n${story || '함께한 시간을 천천히 떠올리며'}\n고마웠던 순간을 오늘 노래할게\n\n[Chorus]\n이 마음이 오래 머물기를\n우리의 시간이 빛나기를`,
    letter: `${recipient}에게.\n\n${story || '함께해 준 시간에 고마움을 전하고 싶었습니다.'}\n\n이 데모는 실제 고객 데이터를 사용하지 않는 포트폴리오용 synthetic output입니다.\n\n- ${sender}`,
    productionBrief: `Genre: ${selectedGenre}. ~90 BPM. Clear 4/4 groove, warm harmonic center, restrained verses and one lifted chorus. Natural lead vocal, close-mic diction, acoustic/electric texture, concise arrangement, clean resolved ending.`,
    generatedAt: new Date().toISOString()
  };
}
