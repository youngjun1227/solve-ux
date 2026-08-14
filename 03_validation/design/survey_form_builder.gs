/**
 * SuperSOL 보험 이용 경험 설문 — Google Form 자동 생성 스크립트
 *
 * 원본: 03_validation/design/survey_deploy_20260814.md (8/15 확정 · 6차 — 실제 폼과 동기화)
 * 문구·보기·순서·분기를 배포본 그대로 생성한다. 임의로 고치지 말 것.
 * 총 12문항 · 질문 페이지 3장(안내+Q1~5 / Q6~11 / Q12+이벤트) · 분기 4개 · 옵션 무작위 없음.
 *
 * ⚠ 폼은 이미 팀장이 제작·확정했다 (8/15). 이 스크립트는 폼이 날아갔을 때
 *   같은 폼을 다시 만들기 위한 백업이다 — 새 폼을 또 만들어 쓰지 말 것.
 *   페이지 1·2는 8/15 스크린샷과 대조 완료. 페이지 3 이후는 5차 구조 전제(대조 전).
 *
 * 실행 방법:
 *   1. script.google.com → 새 프로젝트 → 이 파일 내용 전체를 붙여넣기
 *   2. 함수 선택에서 createSurvey 선택 → 실행 → 권한 승인
 *   3. 실행 로그(Ctrl+Enter)에 뜨는 "편집 URL"을 열면 폼이 있다
 *
 * 스크립트가 못 하는 것 (실행 후 편집 화면에서 수동, 2가지):
 *   A. 이미지 2장
 *      [IMG-1] = "보험tab 첫화면" 제목의 독립 이미지 항목으로 Q6 바로 위에
 *               (8/14 팀장 확보 전체 캡처 — 탭·아이콘·배너·보장 7 목록)
 *      [IMG-2] = Q12 (맞춤 구성 시안 한 장)
 *      "[IMG-...]" 표시 항목을 이미지로 바꾸거나, 첨부 후 표시 항목 삭제.
 *   B. 링크 2개 — 감사 페이지 설명의 (SuperSOL 설치·가입 링크)·(테스트 신청 폼 링크) 교체
 */

function createSurvey() {
  var form = FormApp.create('SuperSOL 보험 이용 경험 설문');

  // ===== 전체 설정 =====
  form.setTitle('보험 앱 이용 경험 설문 (약 3분)');
  form.setDescription(
    '안녕하세요! 저희는 신한 SuperSOL 보험 화면의 사용 경험을 연구하는 ' +
    '대학생 프로젝트 팀입니다.\n\n' + // 팀명(SOL:VE)은 넣지 않는다 — 8/15 확정
    '더 쓰기 편한 보험 화면을 만들기 위해, 실제 이용자분들의 이야기를 듣고자 ' +
    '이 설문을 진행합니다. 약 3분 걸립니다.\n\n' +
    'SuperSOL을 써보지 않으셨어도 참여하실 수 있습니다.\n' +
    '정답은 없습니다 — 모르면 모른다고 답해 주시는 것이 가장 도움이 됩니다.\n\n' +
    '☕ 먼저 응답해 주신 50분께 커피 기프티콘을 드립니다.\n\n' +
    '응답은 통계 목적으로만 씁니다. 이름·생년월일은 받지 않으며, ' +
    '휴대폰 번호는 커피 이벤트에 참여하시는 경우에만 선물 발송을 위해 받고 ' +
    '발송 후 바로 폐기합니다.'
  );
  form.setCollectEmail(false);            // 이메일 수집 끔
  form.setLimitOneResponsePerUser(false); // 응답 1회 제한 끔
  form.setAllowResponseEdits(false);      // 응답 수정 허용 끔
  form.setProgressBar(true);              // 진행률 표시 켬
  form.setShuffleQuestions(false);        // 질문 순서 무작위 끔 (절대)
  // 옵션 순서 무작위: 어떤 문항에도 켜지 않는다

  var C = FormApp.PageNavigationType.CONTINUE;

  // ===== 페이지 1 = 폼 설명 + Q1~Q5 (별도 섹션 없음) =====
  // Q1의 분기는 페이지 끝에서 작동한다 — ①(19세 이하)이어도 Q2~Q5까지 답한 뒤
  // 종료 페이지로 간다. 분석에서 Q1 ① 응답은 전체 제외한다.
  var q1 = form.addMultipleChoiceItem()
    .setTitle('Q1. 연령대를 골라 주세요.')
    .setRequired(true); // 보기·분기는 아래 "분기 연결"에서 설정
  var q2 = form.addMultipleChoiceItem()
    .setTitle('Q2. 신한 SuperSOL(슈퍼쏠) 앱을 쓰고 계신가요?')
    .setRequired(true);
  q2.setChoices([
    q2.createChoice('① 주 1회 이상 쓴다'),
    q2.createChoice('② 월 1회 이상 쓴다'),
    q2.createChoice('③ 설치했지만 거의 안 쓴다'),
    q2.createChoice('④ 예전에 썼지만 지금은 안 쓴다'),
    q2.createChoice('⑤ 써본 적 없다')
  ]); // 분기 없음. 사용자/비사용자를 가르는 유일한 문항 — 빼지 말 것
  var q3 = form.addMultipleChoiceItem()
    .setTitle('Q3. 현재 가입되어 있는 보험이 있나요?')
    .setRequired(true);
  q3.setChoices([
    q3.createChoice('① 내가 직접 가입한 보험만 있다'),
    q3.createChoice('② 가족이 가입해 준 보험만 있다'),
    q3.createChoice('③ 둘 다 있다'),
    q3.createChoice('④ 가입된 보험이 없다'),
    q3.createChoice('⑤ 잘 모르겠다')
  ]);
  var q4 = form.addMultipleChoiceItem()
    .setTitle('Q4. 가족이 가입해 준 보험, 어디까지 알고 계신가요?')
    .setRequired(true); // 6차: 페이지 1로 이동 (5차 Q8)
  q4.setChoices([
    q4.createChoice('① 어떤 보험인지, 보장 내용까지 안다'),
    q4.createChoice('② 어떤 보험인지만 안다'),
    q4.createChoice('③ 있다는 것만 안다'),
    q4.createChoice('④ 없거나, 있는지 모른다')
  ]);
  var q5 = form.addMultipleChoiceItem()
    .setTitle('Q5. 보험 상품 목록이 어떻게 나뉘어 있으면 찾기 쉬울 것 같나요?')
    .setRequired(true);
  q5.setChoices([
    q5.createChoice('① 판매 회사별'),
    q5.createChoice('② 보장 내용별 (암·건강·상해 등)'),
    q5.createChoice('③ 상관없다 / 잘 모르겠다')
  ]);
  // 🔴 페이지 벽 1 — Q5는 Q6 이미지와 같은 페이지 금지 (이미지에 회사 탭이 보인다)

  // ===== 페이지 2 — 화면을 보면서 (Q6~Q11 한 페이지) =====
  var pb2 = form.addPageBreakItem()
    .setTitle('화면을 보면서')
    .setHelpText('이제 화면을 보여드릴게요. 써보신 적이 없어도 그림만 보고 편하게 답해 주세요.');
  form.addSectionHeaderItem()
    .setTitle('[IMG-1] 이 자리에 "보험tab 첫화면" 제목의 이미지 항목 (독립 항목, Q6 바로 위)')
    .setHelpText('이미지: 8/14 팀장 확보 전체 캡처(카테고리 바·[신한은행/신한라이프] 탭·' +
                 '보장/저축투자 아이콘·배너·보장 7 목록). 개인정보 없는 화면이라 마스킹 불필요. ' +
                 '이미지 항목으로 바꾼 뒤 이 표시 항목은 삭제.');
  var q6 = form.addMultipleChoiceItem()
    .setTitle('Q6. 이 화면에서 보험 상품을 찾아본다면, 가장 먼저 어떻게 하실 것 같으세요?')
    .setRequired(true);
  q6.setChoices([
    q6.createChoice('① 아래로 스크롤하며 지금 화면을 본다'),
    q6.createChoice('② 위의 [신한라이프] 탭을 눌러 본다'),
    q6.createChoice('③ 잘 모르겠다')
  ]);
  var q7 = form.addMultipleChoiceItem()
    .setTitle('Q7. 보험 화면이 어떻게 보이면 좋을 것 같으세요?')
    .setRequired(true);
  q7.setChoices([
    q7.createChoice('① 모두에게 같은 전체 목록'),
    q7.createChoice('② 내 나이 기준으로 추린 목록 먼저'),
    q7.createChoice('③ 내가 가입한 보험 기준으로 추린 목록 먼저'),
    q7.createChoice('④ 잘 모르겠다')
  ]);
  var q8 = form.addMultipleChoiceItem()
    .setTitle('Q8. 병원에서 카드 결제가 확인되면 보험금 청구 방법을 알려주는 알림이 ' +
              '있다면 어떠세요?')
    .setRequired(true);
  q8.setChoices([ // 6차: 보기 7→5 (결제 정보 거부감·실손 무관 삭제 — 판정 영향은 배포 문서 분석 메모)
    q8.createChoice('① 받고 싶다'),
    q8.createChoice('② 내가 켠 경우에만 받고 싶다'),
    q8.createChoice('③ 필요 없다 — 청구를 잘 챙기고 있어서'),
    q8.createChoice('④ 받고 싶지 않다 — 알림이 번거로워서'),
    q8.createChoice('⑤ 잘 모르겠다')
  ]);
  var q9 = form.addMultipleChoiceItem()
    .setTitle('Q9. 내 보험이 충분한지 앱이 알려준다면, 어떤 방식이 가장 마음에 드세요?')
    .setRequired(true);
  q9.setChoices([
    q9.createChoice('① 충분한지 부족한지만'),
    q9.createChoice('② 부족한 금액까지 자세히'),
    q9.createChoice('③ 비슷한 나이대와 비교해서'),
    q9.createChoice('④ 알려주는 것 자체가 부담스럽다'),
    q9.createChoice('⑤ 잘 모르겠다')
  ]);
  var q10 = form.addMultipleChoiceItem()
    .setTitle('Q10. SuperSOL(슈퍼쏠) 앱 전체에 대해 얼마나 만족하시나요?')
    .setRequired(true);
  q10.setChoices([
    q10.createChoice('① 매우 만족'),
    q10.createChoice('② 만족'),
    q10.createChoice('③ 보통'),
    q10.createChoice('④ 불만족'),
    q10.createChoice('⑤ 매우 불만족'),
    q10.createChoice('⑥ 써본 적이 없다')
  ]);
  form.addParagraphTextItem()
    .setTitle('Q11. 최근 보험 관련해서 앱을 쓰다가 가장 불편했던 일이 있었다면 ' +
              '적어 주세요. 없으면 비워 두셔도 됩니다.')
    .setRequired(false);

  // ===== 페이지 3 — 시안 + 커피 이벤트 =====
  // ⚠ 여기부터는 8/15 스크린샷 대조 전 — 5차 구조 그대로 생성한다.
  // 🔴 페이지 벽 2 — Q12(시안)는 Q7과 같은 페이지 금지

  var pb3 = form.addPageBreakItem()
    .setTitle('마지막으로 하나만 더')
    .setHelpText('저희가 그려본 보험 화면 시안입니다.\n' +
                 '정답이 없으니 별로면 별로라고 골라 주세요. 그게 저희에게 제일 도움이 됩니다.');
  form.addSectionHeaderItem()
    .setTitle('[IMG-2] 아래 질문(Q12) 카드 안에 이미지 첨부 후 이 항목 삭제')
    .setHelpText('질문 제목 옆 🖼 버튼 — 제목 아래·보기 위에 오게. ' +
                 '이미지: 맞춤 구성 시안 한 장(나이·가입 상태에 맞춘 내용이 위에 오는 보험 화면, ' +
                 '"개선안"·팀명 글자 금지)');
  var q12 = form.addMultipleChoiceItem()
    .setTitle('Q12. 이 화면은 나이대를 기준으로, 맞는 내용을 골라 먼저 보여주는 방식입니다. ' +
              '이 방식이 나에게 맞을 것 같나요?')
    .setRequired(true);
  q12.setChoices([
    q12.createChoice('① 맞을 것 같다'),
    q12.createChoice('② 나이보다 다른 기준(가입 보험·건강 등)이 나을 것 같다'),
    q12.createChoice('③ 골라서 보여주는 것 자체가 별로다'),
    q12.createChoice('④ 잘 모르겠다')
  ]);
  var qEvent = form.addMultipleChoiceItem()
    .setTitle('☕ 커피 이벤트에 참여하시겠어요?')
    .setHelpText('먼저 응답해 주신 50분께 커피 기프티콘을 보내드립니다.')
    .setRequired(true); // 분기는 아래에서

  // ===== 전화번호 페이지 (이벤트 참여자만) =====
  var pbPhone = form.addPageBreakItem().setTitle('선물 받으실 연락처');
  var phoneValidation = FormApp.createTextValidation()
    .setHelpText('휴대폰 번호 형식으로 입력해 주세요 (예: 010-1234-5678)')
    .requireTextMatchesPattern('^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$')
    .build();
  form.addTextItem()
    .setTitle('선물 받으실 휴대폰 번호를 입력해 주세요.')
    .setHelpText('커피 발송에만 사용하고, 발송 후 바로 폐기합니다. (예: 010-1234-5678)')
    .setRequired(true)
    .setValidation(phoneValidation);

  // ===== 감사 페이지 (문항 없음) =====
  var pbThanks = form.addPageBreakItem()
    .setTitle('응답해 주셔서 감사합니다')
    .setHelpText(
      '📱 아직 SuperSOL(슈퍼쏠)을 쓰지 않으신다면 — 아래 링크로 설치하고 가입하시면 ' +
      '메가커피 기프티콘을 받으실 수 있어요.\n' +
      '→ (SuperSOL 설치·가입 링크)\n\n' +
      '🧪 9월에 개선안 사용 테스트(모바일, 약 40분, 소정의 사례)를 진행합니다. ' +
      '참여하고 싶으시면 여기로 신청해 주세요.\n' +
      '→ (테스트 신청 폼 링크)'
    );

  // ===== 종료 페이지 — 만 19세 이하 (문항 없음) =====
  var pbUnder19 = form.addPageBreakItem()
    .setTitle('참여해 주셔서 감사합니다')
    .setHelpText('이 설문은 만 20세 이상을 대상으로 합니다.\n관심 가져 주셔서 감사합니다.');

  // ===== 분기 연결 (모든 페이지가 만들어진 뒤에 설정) =====

  // 감사 페이지를 마친 사람 → 제출 (종료 페이지로 흘러가지 않게)
  pbUnder19.setGoToPage(FormApp.PageNavigationType.SUBMIT);
  // 종료 페이지는 마지막이라 자동 제출

  // Q1: ① → 종료 페이지 / 나머지 → 다음(페이지 2). 페이지 1이 끝날 때 작동한다
  q1.setChoices([
    q1.createChoice('① 만 19세 이하', pbUnder19),
    q1.createChoice('② 20~24세', C),
    q1.createChoice('③ 25~29세', C),
    q1.createChoice('④ 30~34세', C),
    q1.createChoice('⑤ 만 35세 이상', C)
  ]);

  // 이벤트: ① 참여 → 다음(전화번호) / ② 괜찮다 → 감사 페이지
  qEvent.setChoices([
    qEvent.createChoice('① 참여한다 — 선물 받을 휴대폰 번호를 남긴다', C),
    qEvent.createChoice('② 괜찮다', pbThanks)
  ]);

  // ===== 결과 출력 =====
  Logger.log('=== 생성 완료 ===');
  Logger.log('편집 URL: ' + form.getEditUrl());
  Logger.log('응답자 URL: ' + form.getPublishedUrl());
  Logger.log('');
  Logger.log('남은 수동 작업 2가지:');
  Logger.log('1. 이미지 2장 — [IMG-1]→"보험tab 첫화면" 독립 이미지 항목(Q6 위), [IMG-2]→Q12(시안)');
  Logger.log('2. 감사 페이지 설명의 링크 2곳(설치·가입 / 테스트 신청)을 실제 URL로 교체');
  Logger.log('');
  Logger.log('검증: Q1 ①→종료 / 이벤트 ①→전화·②→감사 / Q2 ⑤로 답해도 끝까지 진행되는지');
  Logger.log('주의: 응답 시트의 전화번호 열은 분석 전 /anonymize로 제거. 원본은 03_validation/raw/에만 (커밋 금지)');
}
