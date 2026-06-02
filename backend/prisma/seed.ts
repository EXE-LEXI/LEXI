import {
  AiGenerationStatus,
  AiGenerationType,
  BadgeCriteriaType,
  DailyChallengeType,
  DeviceTokenPlatform,
  LessonDraftStatus,
  LessonReviewStatus,
  LegalSourceCrawlStatus,
  MediaAssetSourceType,
  MediaAssetStatus,
  MediaAssetType,
  NotificationDeliveryStatus,
  NotificationDeliveryType,
  PrismaClient,
  ProgressStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

type QuizSeed = {
  questionText: string;
  explanation: string;
  options: {
    optionText: string;
    isCorrect: boolean;
    sortOrder: number;
  }[];
};

type LessonSeed = {
  moduleId: string;
  slug: string;
  title: string;
  content: string;
  sourceTitle: string;
  sourceUrl: string;
  legalDocumentNo: string;
  effectiveDate: Date;
  reviewerNote: string;
  sortOrder: number;
  reviewStatus?: LessonReviewStatus;
  isActive?: boolean;
  videoUrl?: string | null;
  questions: QuizSeed[];
};

const videoUrl =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

async function main() {
  console.log("Seeding LEXI demo database...");

  const passwordHash = await bcrypt.hash("123456", 10);
  const users = await seedUsers(passwordHash);
  const content = await seedLearningContent();
  await seedLegalSourcesAndDrafts(content);
  await seedMediaAssets(content);
  await seedDemoLearningState(users, content);
  await seedNotifications(users);

  console.log("Demo accounts:");
  console.log("- Learner: demo@lexi.vn / 123456");
  console.log("- Admin: admin@lexi.vn / 123456");
  console.log("Seeding finished.");
}

async function seedUsers(passwordHash: string) {
  const demo = await prisma.user.upsert({
    where: { email: "demo@lexi.vn" },
    update: {
      passwordHash,
      role: UserRole.LEARNER,
      status: UserStatus.ACTIVE,
      profile: {
        upsert: {
          create: {
            fullName: "Người dùng Demo",
            avatarUrl: "https://i.pravatar.cc/160?img=32",
            xp: 460,
            streak: 7,
          },
          update: {
            fullName: "Người dùng Demo",
            avatarUrl: "https://i.pravatar.cc/160?img=32",
            xp: 460,
            streak: 7,
          },
        },
      },
    },
    create: {
      email: "demo@lexi.vn",
      passwordHash,
      role: UserRole.LEARNER,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          fullName: "Người dùng Demo",
          avatarUrl: "https://i.pravatar.cc/160?img=32",
          xp: 460,
          streak: 7,
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@lexi.vn" },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      profile: {
        upsert: {
          create: {
            fullName: "LEXI Admin",
            avatarUrl: "https://i.pravatar.cc/160?img=12",
          },
          update: {
            fullName: "LEXI Admin",
            avatarUrl: "https://i.pravatar.cc/160?img=12",
          },
        },
      },
    },
    create: {
      email: "admin@lexi.vn",
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          fullName: "LEXI Admin",
          avatarUrl: "https://i.pravatar.cc/160?img=12",
        },
      },
    },
  });

  const leaderboardUsers = await Promise.all(
    [
      ["minh@lexi.vn", "Minh Nguyễn", 390, "https://i.pravatar.cc/160?img=5"],
      ["linh@lexi.vn", "Linh Trần", 335, "https://i.pravatar.cc/160?img=47"],
      ["an@lexi.vn", "An Phạm", 280, "https://i.pravatar.cc/160?img=15"],
    ].map(([email, fullName, xp, avatarUrl]) =>
      prisma.user.upsert({
        where: { email: String(email) },
        update: {
          passwordHash,
          role: UserRole.LEARNER,
          status: UserStatus.ACTIVE,
          profile: {
            upsert: {
              create: {
                fullName: String(fullName),
                avatarUrl: String(avatarUrl),
                xp: Number(xp),
                streak: 4,
              },
              update: {
                fullName: String(fullName),
                avatarUrl: String(avatarUrl),
                xp: Number(xp),
                streak: 4,
              },
            },
          },
        },
        create: {
          email: String(email),
          passwordHash,
          role: UserRole.LEARNER,
          status: UserStatus.ACTIVE,
          profile: {
            create: {
              fullName: String(fullName),
              avatarUrl: String(avatarUrl),
              xp: Number(xp),
              streak: 4,
            },
          },
        },
      })
    )
  );

  console.log("Users seeded.");
  return { demo, admin, leaderboardUsers };
}

async function seedLearningContent() {
  const categories = {
    labor: await prisma.category.upsert({
      where: { slug: "luat-lao-dong" },
      update: {
        title: "Luật lao động",
        description: "Quyền lợi, hợp đồng, lương thử việc và nghỉ phép.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/1006/1006555.png",
        sortOrder: 1,
        isActive: true,
      },
      create: {
        slug: "luat-lao-dong",
        title: "Luật lao động",
        description: "Quyền lợi, hợp đồng, lương thử việc và nghỉ phép.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/1006/1006555.png",
        sortOrder: 1,
      },
    }),
    traffic: await prisma.category.upsert({
      where: { slug: "luat-giao-thong" },
      update: {
        title: "Luật giao thông",
        description: "Tốc độ, biển báo, giấy tờ và xử phạt thường gặp.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/2933/2933924.png",
        sortOrder: 2,
        isActive: true,
      },
      create: {
        slug: "luat-giao-thong",
        title: "Luật giao thông",
        description: "Tốc độ, biển báo, giấy tờ và xử phạt thường gặp.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/2933/2933924.png",
        sortOrder: 2,
      },
    }),
    digital: await prisma.category.upsert({
      where: { slug: "an-toan-so" },
      update: {
        title: "An toàn số",
        description: "Nhận diện lừa đảo online và bảo vệ dữ liệu cá nhân.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/6124/6124996.png",
        sortOrder: 3,
        isActive: true,
      },
      create: {
        slug: "an-toan-so",
        title: "An toàn số",
        description: "Nhận diện lừa đảo online và bảo vệ dữ liệu cá nhân.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/6124/6124996.png",
        sortOrder: 3,
      },
    }),
    scam: await prisma.category.upsert({
      where: { slug: "lua-dao-online" },
      update: {
        title: "Lừa đảo online",
        description: "Các chiến thuật lừa đảo qua mạng và cách xử lý an toàn.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/6124/6124996.png",
        sortOrder: 4,
        isActive: true,
      },
      create: {
        slug: "lua-dao-online",
        title: "Lừa đảo online",
        description: "Các chiến thuật lừa đảo qua mạng và cách xử lý an toàn.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/6124/6124996.png",
        sortOrder: 4,
      },
    }),
    consumer: await prisma.category.upsert({
      where: { slug: "bao-ve-nguoi-tieu-dung" },
      update: {
        title: "Bảo vệ người tiêu dùng",
        description: "Đổi trả, bảo hành và khiếu nại khi mua hàng.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
        sortOrder: 5,
        isActive: true,
      },
      create: {
        slug: "bao-ve-nguoi-tieu-dung",
        title: "Bảo vệ người tiêu dùng",
        description: "Đổi trả, bảo hành và khiếu nại khi mua hàng.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
        sortOrder: 5,
      },
    }),
  };

  const modules = {
    laborContract: await upsertModule({
      categoryId: categories.labor.id,
      slug: "hop-dong-lao-dong",
      title: "Hợp đồng lao động",
      description: "Các điểm cần nắm trước khi ký hoặc chấm dứt hợp đồng.",
      sortOrder: 1,
    }),
    laborLeave: await upsertModule({
      categoryId: categories.labor.id,
      slug: "nghi-phep-va-luong",
      title: "Nghỉ phép và tiền lương",
      description: "Lương thử việc, nghỉ hằng năm và những khoản cần được trả.",
      sortOrder: 2,
    }),
    trafficBasics: await upsertModule({
      categoryId: categories.traffic.id,
      slug: "quy-tac-di-duong",
      title: "Quy tắc đi đường",
      description: "Tốc độ, giấy tờ và tình huống bị xử phạt.",
      sortOrder: 1,
    }),
    trafficPapers: await upsertModule({
      categoryId: categories.traffic.id,
      slug: "giay-to-khi-di-duong",
      title: "Giấy tờ khi đi đường",
      description: "GPLX, đăng ký xe, bảo hiểm và cách ứng xử khi được kiểm tra.",
      sortOrder: 2,
    }),
    antiScam: await upsertModule({
      categoryId: categories.digital.id,
      slug: "phishing-va-lua-dao",
      title: "Phishing và lừa đảo",
      description: "Dấu hiệu cảnh báo khi nhận link, mã OTP hoặc lời mời đầu tư.",
      sortOrder: 1,
    }),
    accountSafety: await upsertModule({
      categoryId: categories.digital.id,
      slug: "bao-ve-tai-khoan",
      title: "Bảo vệ tài khoản",
      description: "Mật khẩu, OTP, thiết bị đăng nhập và các bước khóa tài khoản.",
      sortOrder: 2,
    }),
    scamInvestment: await upsertModule({
      categoryId: categories.scam.id,
      slug: "lua-dao-dau-tu",
      title: "Lừa đảo đầu tư",
      description: "Nhận diện lời mời lợi nhuận cao, app giả mạo và nhờ nạp tiền.",
      sortOrder: 1,
    }),
    scamShopping: await upsertModule({
      categoryId: categories.scam.id,
      slug: "lua-dao-mua-ban",
      title: "Lừa đảo mua bán",
      description: "Chuyển khoản cọc, shop ảo và cách giữ bằng chứng giao dịch.",
      sortOrder: 2,
    }),
    shopping: await upsertModule({
      categoryId: categories.consumer.id,
      slug: "mua-hang-online",
      title: "Mua hàng online",
      description: "Quyền đổi trả, thông tin sản phẩm và bằng chứng giao dịch.",
      sortOrder: 1,
    }),
    warranty: await upsertModule({
      categoryId: categories.consumer.id,
      slug: "bao-hanh-va-doi-tra",
      title: "Bảo hành và đổi trả",
      description: "Khi nào được bảo hành, đổi hàng và cách gửi yêu cầu rõ ràng.",
      sortOrder: 2,
    }),
  };

  const lessonSeeds: LessonSeed[] = [
    {
      moduleId: modules.laborContract.id,
      slug: "thu-viec-toi-da-bao-lau",
      title: "Thời gian thử việc tối đa bao lâu?",
      content:
        "Thời gian thử việc phụ thuộc vào tính chất công việc. Vị trí quản lý doanh nghiệp có thể thử việc tối đa 180 ngày; công việc cần trình độ cao đẳng trở lên tối đa 60 ngày; trung cấp, công nhân kỹ thuật, nhân viên nghiệp vụ tối đa 30 ngày; các công việc khác tối đa 6 ngày làm việc.",
      sourceTitle: "Bộ luật Lao động 2019",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=137155",
      legalDocumentNo: "45/2019/QH14",
      effectiveDate: new Date("2021-01-01T00:00:00.000Z"),
      reviewerNote: "Tóm tắt demo chỉ dùng cho học tập; cần kiểm tra nguồn luật trước khi áp dụng.",
      sortOrder: 1,
      videoUrl,
      questions: [
        quiz(
          "Công việc cần trình độ đại học thử việc tối đa bao lâu?",
          "Nhóm cần trình độ cao đẳng trở lên được thử việc tối đa 60 ngày.",
          ["30 ngày", "60 ngày", "90 ngày", "180 ngày"],
          1
        ),
        quiz(
          "Lương thử việc tối thiểu bằng bao nhiêu phần trăm lương của công việc?",
          "Lương thử việc do hai bên thỏa thuận nhưng ít nhất bằng 85%.",
          ["50%", "70%", "85%", "100%"],
          2
        ),
      ],
    },
    {
      moduleId: modules.laborContract.id,
      slug: "don-phuong-cham-dut-hop-dong",
      title: "Báo trước khi nghỉ việc thế nào?",
      content:
        "Người lao động thường phải báo trước khi đơn phương chấm dứt hợp đồng. Thời hạn báo trước phụ thuộc loại hợp đồng và nhóm công việc. Một số trường hợp như không được trả lương, bị ngược đãi, bị quấy rối tại nơi làm việc có thể nghỉ mà không cần báo trước.",
      sourceTitle: "Bộ luật Lao động 2019",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=137155#dieu35",
      legalDocumentNo: "45/2019/QH14",
      effectiveDate: new Date("2021-01-01T00:00:00.000Z"),
      reviewerNote: "Dùng để demo quiz, câu sai và gợi ý ôn tập.",
      sortOrder: 2,
      questions: [
        quiz(
          "Nếu bị công ty không trả lương đúng hạn, người lao động có thể làm gì?",
          "Đây là một trong các trường hợp có thể chấm dứt hợp đồng mà không cần báo trước theo điều kiện luật định.",
          [
            "Bắt buộc làm thêm 30 ngày",
            "Có thể đơn phương chấm dứt không cần báo trước",
            "Không có quyền gì",
            "Chỉ được nghỉ khi công ty đồng ý",
          ],
          1
        ),
        quiz(
          "Việc báo trước khi nghỉ việc phụ thuộc yếu tố nào?",
          "Thời hạn báo trước phụ thuộc loại hợp đồng và tính chất công việc.",
          ["Loại hợp đồng", "Màu áo đồng phục", "Số đồng nghiệp", "Ngày sinh"],
          0
        ),
      ],
    },
    {
      moduleId: modules.laborLeave.id,
      slug: "nghi-phep-nam",
      title: "Nghỉ phép năm có lương",
      content:
        "Người lao động làm đủ 12 tháng cho một người sử dụng lao động thường có ít nhất 12 ngày nghỉ hằng năm hưởng nguyên lương. Số ngày có thể cao hơn với công việc nặng nhọc, độc hại, nguy hiểm hoặc người lao động chưa thành niên.",
      sourceTitle: "Bộ luật Lao động 2019",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=137155#dieu113",
      legalDocumentNo: "45/2019/QH14",
      effectiveDate: new Date("2021-01-01T00:00:00.000Z"),
      reviewerNote: "Phù hợp để demo thử thách hằng ngày.",
      sortOrder: 1,
      questions: [
        quiz(
          "Làm đủ 12 tháng trong điều kiện bình thường có ít nhất bao nhiêu ngày nghỉ hằng năm?",
          "Mức cơ bản thường là 12 ngày nghỉ hằng năm hưởng nguyên lương.",
          ["6 ngày", "10 ngày", "12 ngày", "24 ngày"],
          2
        ),
        quiz(
          "Nghỉ phép năm thông thường có được hưởng lương không?",
          "Nghỉ hằng năm là ngày nghỉ hưởng nguyên lương theo quy định.",
          ["Có", "Không", "Chỉ 50%", "Tùy ý quản lý"],
          0
        ),
      ],
    },
    {
      moduleId: modules.trafficBasics.id,
      slug: "toc-do-trong-khu-dan-cu",
      title: "Tốc độ trong khu đông dân cư",
      content:
        "Khi đi trong khu đông dân cư, người lái xe cần quan sát biển báo và loại đường. Với đường đôi có dải phân cách, tốc độ tối đa thường là 60 km/h; với đường hai chiều không có dải phân cách hoặc đường một chiều một làn xe, thường là 50 km/h.",
      sourceTitle: "Thông tư về tốc độ và khoảng cách an toàn",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx",
      legalDocumentNo: "31/2019/TT-BGTVT",
      effectiveDate: new Date("2019-10-15T00:00:00.000Z"),
      reviewerNote: "Bài học giao thông dùng để demo danh sách module và bài học hiện tại.",
      sortOrder: 1,
      questions: [
        quiz(
          "Trong khu đông dân cư, đường đôi có dải phân cách thường tối đa bao nhiêu?",
          "Mức thường gặp là 60 km/h nếu không có biển báo khác.",
          ["40 km/h", "50 km/h", "60 km/h", "80 km/h"],
          2
        ),
        quiz(
          "Khi có biển báo tốc độ khác với mức chung, cần làm gì?",
          "Biển báo tại hiện trường là chỉ dẫn cần tuân thủ.",
          ["Theo biển báo", "Theo ý kiến bạn bè", "Đi tốc độ tùy thích", "Chỉ cần bật đèn"],
          0
        ),
      ],
    },
    {
      moduleId: modules.trafficPapers.id,
      slug: "giay-to-can-mang-khi-lai-xe",
      title: "Giấy tờ cần mang khi lái xe",
      content:
        "Khi điều khiển phương tiện, người lái xe nên mang giấy phép lái xe phù hợp, đăng ký xe, chứng nhận bảo hiểm bắt buộc và giấy tờ liên quan. Nếu bị kiểm tra, hãy bình tĩnh xuất trình giấy tờ và ghi nhận thông tin xử lý nếu cần.",
      sourceTitle: "Quy định xử phạt vi phạm giao thông đường bộ",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx",
      legalDocumentNo: "100/2019/ND-CP",
      effectiveDate: new Date("2020-01-01T00:00:00.000Z"),
      reviewerNote: "Bài học giấy tờ giao thông dùng để demo module.",
      sortOrder: 1,
      questions: [
        quiz(
          "Giấy tờ nào thường cần mang khi lái xe?",
          "Người lái xe cần mang GPLX phù hợp và giấy tờ xe bắt buộc.",
          ["Giấy phép lái xe", "Thẻ thành viên", "Hóa đơn cà phê", "Mật khẩu email"],
          0
        ),
        quiz(
          "Khi được yêu cầu kiểm tra giấy tờ, việc nên làm là gì?",
          "Nên bình tĩnh xuất trình giấy tờ và ghi nhận thông tin nếu cần khiếu nại.",
          ["Bình tĩnh xuất trình", "Bỏ chạy", "Xóa tin nhắn", "Đưa OTP"],
          0
        ),
      ],
    },
    {
      moduleId: modules.antiScam.id,
      slug: "nhan-dien-link-phishing",
      title: "Nhận diện link phishing",
      content:
        "Link phishing thường tạo cảm giác khẩn cấp, yêu cầu nhập mật khẩu, OTP hoặc thông tin thẻ. Hãy kiểm tra tên miền, không bấm link lạ, và liên hệ kênh chính thức nếu thông báo liên quan tài khoản, ngân hàng hoặc đơn hàng.",
      sourceTitle: "Khuyến nghị an toàn thông tin cá nhân",
      sourceUrl: "https://khonggianmang.vn",
      legalDocumentNo: "Demo-Cyber-01",
      effectiveDate: new Date("2024-01-01T00:00:00.000Z"),
      reviewerNote: "Bài học demo về an toàn số.",
      sortOrder: 1,
      questions: [
        quiz(
          "Dấu hiệu nào thường gặp ở link phishing?",
          "Phishing thường dùng sự khẩn cấp để ép người dùng nhập thông tin nhạy cảm.",
          [
            "Yêu cầu OTP gấp",
            "Có điều khoản rõ ràng",
            "Tên miền đúng chính thức",
            "Không cần thông tin cá nhân",
          ],
          0
        ),
        quiz(
          "Khi nghi ngờ link ngân hàng giả mạo, việc nên làm là gì?",
          "Nên tự mở app/trang chính thức hoặc gọi tổng đài chính thức.",
          ["Nhập OTP để kiểm tra", "Chuyển tiếp cho mọi người", "Liên hệ kênh chính thức", "Tắt khóa màn hình"],
          2
        ),
      ],
    },
    {
      moduleId: modules.accountSafety.id,
      slug: "bao-ve-otp-va-mat-khau",
      title: "Bảo vệ OTP và mật khẩu",
      content:
        "OTP và mật khẩu là thông tin bảo mật cá nhân, không chia sẻ qua điện thoại, tin nhắn hay form lạ. Khi nghi ngờ bị lộ thông tin, hãy đổi mật khẩu, đăng xuất thiết bị lạ và liên hệ kênh hỗ trợ chính thức.",
      sourceTitle: "Khuyến nghị bảo vệ dữ liệu cá nhân",
      sourceUrl: "https://khonggianmang.vn",
      legalDocumentNo: "Demo-Cyber-02",
      effectiveDate: new Date("2024-01-01T00:00:00.000Z"),
      reviewerNote: "Bài học bảo vệ tài khoản cho danh mục An toàn số.",
      sortOrder: 1,
      questions: [
        quiz(
          "OTP có nên chia sẻ cho người tự xưng là nhân viên hỗ trợ không?",
          "OTP là mã xác thực cá nhân, không nên chia sẻ cho bất kỳ ai.",
          ["Có", "Không", "Chỉ chia sẻ vào ban đêm", "Chỉ khi được hứa tặng quà"],
          1
        ),
        quiz(
          "Khi nghi tài khoản bị lộ mật khẩu, nên làm gì?",
          "Đổi mật khẩu và đăng xuất các thiết bị lạ là bước cần làm sớm.",
          ["Đổi mật khẩu", "Đăng thêm ảnh cá nhân", "Chuyển tiền kiểm tra", "Bỏ qua"],
          0
        ),
      ],
    },
    {
      moduleId: modules.scamInvestment.id,
      slug: "nhan-dien-app-dau-tu-gia-mao",
      title: "Nhận diện app đầu tư giả mạo",
      content:
        "Lừa đảo đầu tư thường hứa lợi nhuận cao, yêu cầu nạp tiền liên tục và tạo áp lực mời thêm người tham gia. Hãy kiểm tra pháp nhân, giấy phép, điều khoản rút tiền và cảnh giác với lời cam kết chắc chắn có lãi.",
      sourceTitle: "Cảnh báo lừa đảo đầu tư trực tuyến",
      sourceUrl: "https://lexi.local/sources/lua-dao-dau-tu",
      legalDocumentNo: "DEMO-SCAM-01",
      effectiveDate: new Date("2026-01-01T00:00:00.000Z"),
      reviewerNote: "Bài học lừa đảo đầu tư cho danh mục Lừa đảo online.",
      sortOrder: 1,
      questions: [
        quiz(
          "Dấu hiệu nào đáng nghi trong lời mời đầu tư?",
          "Cam kết lợi nhuận cao và chắc chắn là dấu hiệu cần cảnh giác.",
          ["Cam kết lợi nhuận chắc chắn", "Công khai rủi ro", "Hợp đồng rõ ràng", "Thông tin pháp nhân minh bạch"],
          0
        ),
        quiz(
          "Trước khi nạp tiền vào app đầu tư lạ, nên làm gì?",
          "Cần kiểm tra pháp nhân, giấy phép và điều kiện rút tiền.",
          ["Kiểm tra pháp nhân", "Nạp thử toàn bộ tiền", "Gửi OTP cho tư vấn", "Mượn tiền bạn bè"],
          0
        ),
      ],
    },
    {
      moduleId: modules.scamShopping.id,
      slug: "tranh-bi-lua-coc-mua-hang",
      title: "Tránh bị lừa cọc mua hàng",
      content:
        "Khi mua hàng qua mạng xã hội, hãy kiểm tra lịch sử bán hàng, đánh giá, thông tin người nhận tiền và ưu tiên kênh có bảo vệ người mua. Nếu cần đặt cọc, nên lưu hóa đơn, tin nhắn và thỏa thuận giao dịch.",
      sourceTitle: "Cảnh báo lừa đảo mua bán online",
      sourceUrl: "https://lexi.local/sources/lua-dao-mua-ban",
      legalDocumentNo: "DEMO-SCAM-02",
      effectiveDate: new Date("2026-01-01T00:00:00.000Z"),
      reviewerNote: "Bài học lừa đảo mua bán cho danh mục cũ.",
      sortOrder: 1,
      questions: [
        quiz(
          "Khi người bán yêu cầu đặt cọc gấp, nên làm gì?",
          "Nên kiểm tra người bán và lưu bằng chứng trước khi chuyển tiền.",
          ["Kiểm tra và lưu bằng chứng", "Chuyển ngay", "Gửi OTP", "Xóa đoạn chat"],
          0
        ),
        quiz(
          "Bằng chứng nào hữu ích khi bị lừa mua hàng?",
          "Tin nhắn, biên lai chuyển khoản và thông tin bài đăng là bằng chứng quan trọng.",
          ["Tin nhắn và biên lai", "Mật khẩu app ngân hàng", "Ảnh phong cảnh", "Lịch sử xem phim"],
          0
        ),
      ],
    },
    {
      moduleId: modules.shopping.id,
      slug: "doi-tra-khi-mua-hang-online",
      title: "Đổi trả khi mua hàng online",
      content:
        "Khi mua hàng online, người tiêu dùng nên lưu thông tin sản phẩm, hóa đơn, tin nhắn và chính sách đổi trả. Nếu hàng sai mô tả, kém chất lượng hoặc không đúng cam kết, các bằng chứng này giúp yêu cầu hỗ trợ, đổi trả hoặc khiếu nại.",
      sourceTitle: "Luật Bảo vệ quyền lợi người tiêu dùng",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx",
      legalDocumentNo: "19/2023/QH15",
      effectiveDate: new Date("2024-07-01T00:00:00.000Z"),
      reviewerNote: "Bài học bảo vệ người tiêu dùng dùng để demo trạng thái còn lại.",
      sortOrder: 1,
      questions: [
        quiz(
          "Bằng chứng nào nên lưu khi mua hàng online?",
          "Hóa đơn, tin nhắn, ảnh sản phẩm và chính sách đổi trả đều hữu ích khi cần khiếu nại.",
          ["Hóa đơn và tin nhắn", "Mật khẩu tài khoản", "OTP ngân hàng", "Không cần lưu gì"],
          0
        ),
        quiz(
          "Nếu hàng không đúng mô tả, người mua nên làm gì đầu tiên?",
          "Nên liên hệ người bán/sàn thương mại kèm bằng chứng trước khi leo thang khiếu nại.",
          ["Xóa lịch sử mua", "Gửi yêu cầu hỗ trợ kèm bằng chứng", "Bỏ qua", "Chuyển thêm tiền"],
          1
        ),
      ],
    },
    {
      moduleId: modules.warranty.id,
      slug: "yeu-cau-bao-hanh-dung-cach",
      title: "Yêu cầu bảo hành đúng cách",
      content:
        "Khi sản phẩm còn thời hạn bảo hành, người mua nên chuẩn bị hóa đơn, phiếu bảo hành, ảnh/video lỗi và mô tả tình trạng. Yêu cầu bảo hành nên ghi rõ ngày mua, lỗi gặp phải và mong muốn sửa, đổi hoặc hoàn tiền theo chính sách.",
      sourceTitle: "Luật Bảo vệ quyền lợi người tiêu dùng",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx",
      legalDocumentNo: "19/2023/QH15",
      effectiveDate: new Date("2024-07-01T00:00:00.000Z"),
      reviewerNote: "Bài học bảo hành cho danh mục người tiêu dùng.",
      sortOrder: 1,
      questions: [
        quiz(
          "Khi yêu cầu bảo hành, nên chuẩn bị gì?",
          "Hóa đơn, phiếu bảo hành và bằng chứng lỗi sản phẩm giúp xử lý nhanh hơn.",
          ["Hóa đơn và bằng chứng lỗi", "OTP ngân hàng", "Mật khẩu email", "Không cần gì"],
          0
        ),
        quiz(
          "Yêu cầu bảo hành nên ghi rõ nội dung nào?",
          "Nên ghi ngày mua, lỗi gặp phải và mong muốn xử lý.",
          ["Lỗi gặp phải và cách xử lý mong muốn", "Sở thích cá nhân", "Tên bài hát", "Mẫu xe yêu thích"],
          0
        ),
      ],
    },
    {
      moduleId: modules.laborLeave.id,
      slug: "demo-in-review-tu-ai-draft",
      title: "Demo lesson đang review từ AI draft",
      content:
        "Lesson này ở trạng thái IN_REVIEW và inactive để demo quy trình Admin CMS. Reviewer có thể sửa nội dung, thêm quiz, gắn video rồi publish.",
      sourceTitle: "Demo internal source",
      sourceUrl: "https://lexi.local/demo-source",
      legalDocumentNo: "DEMO-REVIEW",
      effectiveDate: new Date("2026-05-01T00:00:00.000Z"),
      reviewerNote: "Dùng mục này để demo bước duyệt cuối trước khi publish.",
      sortOrder: 99,
      reviewStatus: LessonReviewStatus.IN_REVIEW,
      isActive: false,
      questions: [
        quiz(
          "Lesson IN_REVIEW có hiện trên app learner không?",
          "Learner app chỉ lấy lesson active và PUBLISHED.",
          ["Có", "Không", "Chỉ hiện trên leaderboard", "Chỉ hiện khi logout"],
          1
        ),
      ],
    },
  ];

  const lessons: Record<
    string,
    Awaited<ReturnType<typeof prisma.lesson.upsert>>
  > = {};
  for (const seed of lessonSeeds) {
    lessons[seed.slug] = await upsertLesson(seed);
    await replaceLessonQuestions(lessons[seed.slug].id, seed.questions);
  }

  console.log("Categories, modules, lessons and quizzes seeded.");
  return { categories, modules, lessons };
}

async function upsertModule(params: {
  categoryId: string;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
}) {
  return prisma.learningModule.upsert({
    where: { slug: params.slug },
    update: {
      categoryId: params.categoryId,
      title: params.title,
      description: params.description,
      sortOrder: params.sortOrder,
      isActive: true,
    },
    create: {
      categoryId: params.categoryId,
      slug: params.slug,
      title: params.title,
      description: params.description,
      sortOrder: params.sortOrder,
    },
  });
}

async function upsertLesson(seed: LessonSeed) {
  return prisma.lesson.upsert({
    where: { slug: seed.slug },
    update: {
      moduleId: seed.moduleId,
      title: seed.title,
      content: seed.content,
      videoUrl: seed.videoUrl ?? null,
      sourceTitle: seed.sourceTitle,
      sourceUrl: seed.sourceUrl,
      legalDocumentNo: seed.legalDocumentNo,
      effectiveDate: seed.effectiveDate,
      reviewedAt: new Date(),
      reviewerNote: seed.reviewerNote,
      sortOrder: seed.sortOrder,
      reviewStatus: seed.reviewStatus ?? LessonReviewStatus.PUBLISHED,
      isActive: seed.isActive ?? true,
    },
    create: {
      moduleId: seed.moduleId,
      slug: seed.slug,
      title: seed.title,
      content: seed.content,
      videoUrl: seed.videoUrl ?? null,
      sourceTitle: seed.sourceTitle,
      sourceUrl: seed.sourceUrl,
      legalDocumentNo: seed.legalDocumentNo,
      effectiveDate: seed.effectiveDate,
      reviewedAt: new Date(),
      reviewerNote: seed.reviewerNote,
      sortOrder: seed.sortOrder,
      reviewStatus: seed.reviewStatus ?? LessonReviewStatus.PUBLISHED,
      isActive: seed.isActive ?? true,
    },
  });
}

function quiz(
  questionText: string,
  explanation: string,
  optionTexts: string[],
  correctIndex: number
): QuizSeed {
  return {
    questionText,
    explanation,
    options: optionTexts.map((optionText, index) => ({
      optionText,
      isCorrect: index === correctIndex,
      sortOrder: index + 1,
    })),
  };
}

async function replaceLessonQuestions(lessonId: string, questions: QuizSeed[]) {
  await prisma.quizQuestion.deleteMany({ where: { lessonId } });

  for (const [index, question] of questions.entries()) {
    await prisma.quizQuestion.create({
      data: {
        lessonId,
        questionText: question.questionText,
        explanation: question.explanation,
        sortOrder: index + 1,
        options: {
          create: question.options,
        },
      },
    });
  }
}

async function seedLegalSourcesAndDrafts(
  content: Awaited<ReturnType<typeof seedLearningContent>>
) {
  const sources = {
    laborLeave: await upsertSource({
      title: "Trích điều về nghỉ hằng năm",
      sourceUrl: "https://lexi.local/sources/nghi-hang-nam",
      legalDocumentNo: "45/2019/QH14",
      effectiveDate: new Date("2021-01-01T00:00:00.000Z"),
      crawlStatus: LegalSourceCrawlStatus.CRAWLED,
      rawText:
        "Người lao động làm việc đủ 12 tháng cho một người sử dụng lao động thì được nghỉ hằng năm, hưởng nguyên lương theo hợp đồng lao động.",
    }),
    trafficFine: await upsertSource({
      title: "Xử phạt không mang giấy phép lái xe",
      sourceUrl: "https://lexi.local/sources/khong-mang-gplx",
      legalDocumentNo: "100/2019/ND-CP",
      effectiveDate: new Date("2020-01-01T00:00:00.000Z"),
      crawlStatus: LegalSourceCrawlStatus.CRAWLED,
      rawText:
        "Người điều khiển phương tiện cần mang theo giấy phép lái xe, đăng ký xe và các giấy tờ liên quan khi tham gia giao thông.",
    }),
    pending: await upsertSource({
      title: "Nguồn đang chờ crawl - bảo hành hàng điện tử",
      sourceUrl: "https://lexi.local/sources/pending-warranty",
      legalDocumentNo: "PENDING-DEMO",
      effectiveDate: new Date("2026-05-01T00:00:00.000Z"),
      crawlStatus: LegalSourceCrawlStatus.PENDING,
      rawText: "Nguồn tạm đang chờ crawler xử lý.",
    }),
    failed: await upsertSource({
      title: "Nguồn lỗi crawl - link hết hạn",
      sourceUrl: "https://lexi.local/sources/failed-expired-link",
      legalDocumentNo: "FAILED-DEMO",
      effectiveDate: new Date("2026-05-01T00:00:00.000Z"),
      crawlStatus: LegalSourceCrawlStatus.FAILED,
      rawText: "Crawler không thể lấy nguồn này trong chế độ demo.",
    }),
  };

  const laborJob = await upsertGenerationJob({
    sourceDocumentId: sources.laborLeave.id,
    targetModuleId: content.modules.laborLeave.id,
    status: AiGenerationStatus.SUCCEEDED,
    model: "local-demo-generator",
    promptVersion: "demo-seed-v1",
  });
  const trafficJob = await upsertGenerationJob({
    sourceDocumentId: sources.trafficFine.id,
    targetModuleId: content.modules.trafficBasics.id,
    status: AiGenerationStatus.SUCCEEDED,
    model: "local-demo-generator",
    promptVersion: "demo-seed-v1",
  });

  const acceptedDraft = await upsertDraft({
    title: "Cần mang giấy phép lái xe khi ra đường?",
    sourceDocumentId: sources.trafficFine.id,
    generationJobId: trafficJob.id,
    moduleId: content.modules.trafficBasics.id,
    status: LessonDraftStatus.ACCEPTED,
    content:
      "Khi điều khiển xe, người lái cần mang theo giấy phép lái xe phù hợp, đăng ký xe và các giấy tờ bắt buộc. Nếu không xuất trình được khi bị kiểm tra, có thể bị xử phạt theo quy định.",
    reviewerNote: "Draft đã duyệt, sẵn sàng demo nút Tạo lesson.",
    videoScript:
      "Cảnh 1: người lái xe bị dừng kiểm tra. Cảnh 2: checklist giấy tờ cần mang. Cảnh 3: lời khuyên lưu bản sao thông tin.",
    videoPrompt:
      "Short friendly explainer video about carrying driving documents in Vietnam.",
    questions: [
      quiz(
        "Khi tham gia giao thông, giấy tờ nào thường cần mang?",
        "Người lái cần có giấy phép lái xe phù hợp và giấy tờ xe liên quan.",
        ["Giấy phép lái xe", "Thẻ thành viên siêu thị", "Hóa đơn ăn trưa", "Mật khẩu email"],
        0
      ),
      quiz(
        "Draft ACCEPTED trong admin có thể làm gì tiếp?",
        "Sprint 13 cho phép tạo lesson IN_REVIEW từ draft ACCEPTED.",
        ["Tạo lesson", "Tự động publish", "Xóa backend", "Khóa tài khoản learner"],
        0
      ),
    ],
  });

  await upsertDraft({
    title: "Quyền nghỉ phép năm cho nhân viên mới",
    sourceDocumentId: sources.laborLeave.id,
    generationJobId: laborJob.id,
    moduleId: content.modules.laborLeave.id,
    status: LessonDraftStatus.IN_REVIEW,
    content:
      "Nhân viên cần hiểu cách tính nghỉ phép năm, điều kiện hưởng lương và cách trao đổi với công ty khi chưa làm đủ 12 tháng.",
    reviewerNote: "Cần reviewer bổ sung ví dụ tính ngày nghỉ theo tháng.",
    videoScript: "Nhân vật hỏi HR về ngày nghỉ phép còn lại.",
    videoPrompt: "Cảnh giải thích trong văn phòng về số ngày nghỉ phép còn lại.",
    questions: [
      quiz(
        "Lesson draft IN_REVIEW có tạo lesson được ngay không?",
        "Endpoint chỉ cho convert draft có status ACCEPTED.",
        ["Có", "Không", "Chỉ khi là REJECTED", "Chỉ khi không có source"],
        1
      ),
    ],
  });

  await upsertDraft({
    title: "Draft bị từ chối - link khuyến mãi giả mạo",
    sourceDocumentId: sources.failed.id,
    generationJobId: laborJob.id,
    moduleId: content.modules.antiScam.id,
    status: LessonDraftStatus.REJECTED,
    content:
      "Bản nháp này bị từ chối vì nguồn crawl không đáng tin cậy và cần kiểm chứng thêm.",
    reviewerNote: "Mục demo đã bị từ chối để kiểm tra bộ lọc và trạng thái UI.",
    videoScript: null,
    videoPrompt: null,
    questions: [
      quiz(
        "Draft REJECTED có nên publish không?",
        "Draft bị từ chối cần sửa hoặc tạo lại từ nguồn tin cậy.",
        ["Có ngay", "Không", "Tự động publish", "Gắn video là xong"],
        1
      ),
    ],
  });

  const convertedLesson = content.lessons["demo-in-review-tu-ai-draft"];
  await upsertDraft({
    title: "Draft đã convert - nghỉ phép năm",
    sourceDocumentId: sources.laborLeave.id,
    generationJobId: laborJob.id,
    moduleId: content.modules.laborLeave.id,
    createdLessonId: convertedLesson.id,
    status: LessonDraftStatus.ACCEPTED,
    content: convertedLesson.content ?? "Converted draft demo.",
    reviewerNote: "Draft này đã tạo lesson, UI sẽ disable nút Tạo lesson.",
    videoScript: "Converted draft script.",
    videoPrompt: "Prompt video cho draft đã chuyển đổi.",
    questions: [
      quiz(
        "Draft đã có createdLessonId có convert lại được không?",
        "Backend chặn convert trùng một draft.",
        ["Có", "Không", "Chỉ admin mới được", "Nếu đổi slug"],
        1
      ),
    ],
  });

  await upsertMediaAsset({
    title: "Video script cho draft GPLX",
    draftId: acceptedDraft.id,
    sourceType: MediaAssetSourceType.RENDER_REQUEST,
    status: MediaAssetStatus.RENDERING,
    provider: "demo-renderer",
    renderPrompt:
      "Tạo video dọc 30 giây giải thích về việc mang giấy tờ khi lái xe.",
  });

  console.log("Legal sources, AI jobs and lesson drafts seeded.");
}

async function upsertSource(params: {
  title: string;
  sourceUrl: string;
  legalDocumentNo: string;
  effectiveDate: Date;
  crawlStatus: LegalSourceCrawlStatus;
  rawText: string;
}) {
  return prisma.legalSourceDocument.upsert({
    where: { sourceUrl: params.sourceUrl },
    update: {
      title: params.title,
      legalDocumentNo: params.legalDocumentNo,
      effectiveDate: params.effectiveDate,
      crawlStatus: params.crawlStatus,
      rawText: params.rawText,
      normalizedText: params.rawText,
      contentHash: `demo-${params.legalDocumentNo}`,
      crawledAt:
        params.crawlStatus === LegalSourceCrawlStatus.CRAWLED
          ? new Date()
          : null,
    },
    create: {
      title: params.title,
      sourceUrl: params.sourceUrl,
      legalDocumentNo: params.legalDocumentNo,
      effectiveDate: params.effectiveDate,
      crawlStatus: params.crawlStatus,
      rawText: params.rawText,
      normalizedText: params.rawText,
      contentHash: `demo-${params.legalDocumentNo}`,
      crawledAt:
        params.crawlStatus === LegalSourceCrawlStatus.CRAWLED
          ? new Date()
          : null,
    },
  });
}

async function upsertGenerationJob(params: {
  sourceDocumentId: string;
  targetModuleId: string;
  status: AiGenerationStatus;
  model: string;
  promptVersion: string;
}) {
  const existing = await prisma.aiGenerationJob.findFirst({
    where: {
      sourceDocumentId: params.sourceDocumentId,
      targetModuleId: params.targetModuleId,
      promptVersion: params.promptVersion,
      type: AiGenerationType.FULL_LESSON_PACKAGE,
    },
  });

  const data = {
    sourceDocument: { connect: { id: params.sourceDocumentId } },
    targetModule: { connect: { id: params.targetModuleId } },
    type: AiGenerationType.FULL_LESSON_PACKAGE,
    status: params.status,
    promptVersion: params.promptVersion,
    model: params.model,
    inputSnapshot: { seed: "demo" },
    output: { status: "seeded" },
    errorMessage: null,
  };

  if (existing) {
    return prisma.aiGenerationJob.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.aiGenerationJob.create({ data });
}

async function upsertDraft(params: {
  title: string;
  sourceDocumentId: string;
  generationJobId: string;
  moduleId: string;
  createdLessonId?: string;
  status: LessonDraftStatus;
  content: string;
  reviewerNote: string;
  videoScript: string | null;
  videoPrompt: string | null;
  questions: QuizSeed[];
}) {
  const existing = await prisma.lessonDraft.findFirst({
    where: { title: params.title },
  });

  const baseData = {
    sourceDocument: { connect: { id: params.sourceDocumentId } },
    generationJob: { connect: { id: params.generationJobId } },
    module: { connect: { id: params.moduleId } },
    title: params.title,
    content: params.content,
    videoScript: params.videoScript,
    videoPrompt: params.videoPrompt,
    reviewerNote: params.reviewerNote,
    status: params.status,
  };
  const questionCreates = params.questions.map((question, index) => ({
    questionText: question.questionText,
    explanation: question.explanation,
    sortOrder: index + 1,
    options: {
      create: question.options,
    },
  }));

  const lessonLinkData = params.createdLessonId
    ? { createdLesson: { connect: { id: params.createdLessonId } } }
    : existing?.createdLessonId
    ? { createdLesson: { disconnect: true } }
    : {};

  const updateData = {
    ...baseData,
    ...lessonLinkData,
    questions: {
      deleteMany: {},
      create: questionCreates,
    },
  };

  if (existing) {
    return prisma.lessonDraft.update({
      where: { id: existing.id },
      data: updateData,
      include: { questions: { include: { options: true } } },
    });
  }

  return prisma.lessonDraft.create({
    data: {
      ...baseData,
      ...(params.createdLessonId
        ? { createdLesson: { connect: { id: params.createdLessonId } } }
        : {}),
      questions: {
        create: questionCreates,
      },
    },
    include: { questions: { include: { options: true } } },
  });
}

async function seedMediaAssets(
  content: Awaited<ReturnType<typeof seedLearningContent>>
) {
  await upsertMediaAsset({
    title: "READY video - thời gian thử việc",
    lessonId: content.lessons["thu-viec-toi-da-bao-lau"].id,
    sourceType: MediaAssetSourceType.EXTERNAL_URL,
    status: MediaAssetStatus.READY,
    url: videoUrl,
    mimeType: "video/mp4",
    provider: "external-url",
    renderPrompt: null,
  });

  await upsertMediaAsset({
    title: "READY video có thể attach",
    sourceType: MediaAssetSourceType.EXTERNAL_URL,
    status: MediaAssetStatus.READY,
    url: videoUrl,
    mimeType: "video/mp4",
    provider: "external-url",
    renderPrompt: null,
  });

  await upsertMediaAsset({
    title: "Render request đang xử lý",
    sourceType: MediaAssetSourceType.RENDER_REQUEST,
    status: MediaAssetStatus.RENDERING,
    provider: "demo-renderer",
    renderPrompt:
      "Tạo hoạt ảnh giải thích pháp lý đơn giản về quyền nghỉ hằng năm.",
  });

  await upsertMediaAsset({
    title: "Render failed có thể retry",
    sourceType: MediaAssetSourceType.RENDER_REQUEST,
    status: MediaAssetStatus.FAILED,
    provider: "demo-renderer",
    renderPrompt: "Media demo lỗi này dùng để kiểm tra bộ lọc trạng thái trong admin.",
  });

  console.log("Media assets seeded.");
}

async function upsertMediaAsset(params: {
  title: string;
  lessonId?: string;
  draftId?: string;
  sourceType: MediaAssetSourceType;
  status: MediaAssetStatus;
  url?: string | null;
  mimeType?: string | null;
  provider?: string | null;
  renderPrompt?: string | null;
}) {
  const existing = await prisma.mediaAsset.findFirst({
    where: { title: params.title },
  });
  const data = {
    lesson: params.lessonId
      ? { connect: { id: params.lessonId } }
      : existing?.lessonId
      ? { disconnect: true }
      : undefined,
    draft: params.draftId
      ? { connect: { id: params.draftId } }
      : existing?.draftId
      ? { disconnect: true }
      : undefined,
    title: params.title,
    assetType: MediaAssetType.VIDEO,
    sourceType: params.sourceType,
    status: params.status,
    url: params.url ?? null,
    mimeType: params.mimeType ?? null,
    provider: params.provider ?? null,
    renderPrompt: params.renderPrompt ?? null,
    metadata: {
      seed: "demo",
      updatedBy: "prisma-seed",
    },
  };

  if (existing) {
    return prisma.mediaAsset.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.mediaAsset.create({ data });
}

async function seedDemoLearningState(
  users: Awaited<ReturnType<typeof seedUsers>>,
  content: Awaited<ReturnType<typeof seedLearningContent>>
) {
  const allSeedUsers = [users.demo, ...users.leaderboardUsers];
  for (const user of allSeedUsers) {
    await prisma.notificationDeliveryLog.deleteMany({
      where: { userId: user.id },
    });
    await prisma.deviceToken.deleteMany({ where: { userId: user.id } });
    await prisma.userChallenge.deleteMany({ where: { userId: user.id } });
    await prisma.userBadge.deleteMany({ where: { userId: user.id } });
    await prisma.userProgress.deleteMany({ where: { userId: user.id } });
    await prisma.lessonAttempt.deleteMany({ where: { userId: user.id } });
  }

  const now = new Date();
  const today9 = atHour(now, 9);
  const today10 = atHour(now, 10);
  const today11 = atHour(now, 11);
  const yesterday = daysAgo(now, 1, 20);

  await recordAttempt(
    users.demo.id,
    content.lessons["thu-viec-toi-da-bao-lau"].id,
    [true, true],
    today9
  );
  await recordAttempt(
    users.demo.id,
    content.lessons["don-phuong-cham-dut-hop-dong"].id,
    [false, true],
    today10
  );
  await recordAttempt(
    users.demo.id,
    content.lessons["nghi-phep-nam"].id,
    [true, true],
    today11
  );
  await recordAttempt(
    users.demo.id,
    content.lessons["toc-do-trong-khu-dan-cu"].id,
    [false, true],
    yesterday
  );
  await recordAttempt(
    users.demo.id,
    content.lessons["nhan-dien-link-phishing"].id,
    [true, false],
    daysAgo(now, 2, 19)
  );
  await recordAttempt(
    users.demo.id,
    content.lessons["doi-tra-khi-mua-hang-online"].id,
    [true, true],
    daysAgo(now, 3, 19)
  );
  await recordAttempt(
    users.demo.id,
    content.lessons["thu-viec-toi-da-bao-lau"].id,
    [true, false],
    daysAgo(now, 4, 19)
  );
  await recordAttempt(
    users.demo.id,
    content.lessons["don-phuong-cham-dut-hop-dong"].id,
    [true, true],
    daysAgo(now, 5, 19)
  );
  await recordAttempt(
    users.demo.id,
    content.lessons["nghi-phep-nam"].id,
    [false, true],
    daysAgo(now, 6, 19)
  );

  await upsertProgress(
    users.demo.id,
    content.lessons["thu-viec-toi-da-bao-lau"].id,
    ProgressStatus.COMPLETED,
    100,
    today9
  );
  await upsertProgress(
    users.demo.id,
    content.lessons["don-phuong-cham-dut-hop-dong"].id,
    ProgressStatus.COMPLETED,
    50,
    today10
  );
  await upsertProgress(
    users.demo.id,
    content.lessons["nghi-phep-nam"].id,
    ProgressStatus.COMPLETED,
    100,
    today11
  );
  await upsertProgress(
    users.demo.id,
    content.lessons["toc-do-trong-khu-dan-cu"].id,
    ProgressStatus.IN_PROGRESS,
    50,
    null
  );

  await seedBadgesForDemoUser(users.demo.id, now);
  await seedDailyChallengeReadyToClaim(users.demo.id, now);

  await recordAttempt(
    users.leaderboardUsers[0].id,
    content.lessons["thu-viec-toi-da-bao-lau"].id,
    [true, true],
    today10
  );
  await recordAttempt(
    users.leaderboardUsers[0].id,
    content.lessons["nhan-dien-link-phishing"].id,
    [true, true],
    today11
  );
  await recordAttempt(
    users.leaderboardUsers[1].id,
    content.lessons["nghi-phep-nam"].id,
    [true, false],
    today10
  );
  await recordAttempt(
    users.leaderboardUsers[1].id,
    content.lessons["doi-tra-khi-mua-hang-online"].id,
    [true, true],
    yesterday
  );
  await recordAttempt(
    users.leaderboardUsers[2].id,
    content.lessons["toc-do-trong-khu-dan-cu"].id,
    [false, true],
    today9
  );

  console.log(
    "Demo learning progress, attempts, badges and leaderboard seeded."
  );
}

function atHour(base: Date, hour: number) {
  const date = new Date(base);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function daysAgo(base: Date, days: number, hour: number) {
  const date = atHour(base, hour);
  date.setDate(date.getDate() - days);
  return date;
}

async function recordAttempt(
  userId: string,
  lessonId: string,
  answerPattern: boolean[],
  finishedAt: Date
) {
  const questions = await prisma.quizQuestion.findMany({
    where: { lessonId },
    include: { options: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  const answers = questions.map((question, index) => {
    const shouldBeCorrect = answerPattern[index] ?? true;
    const selectedOption =
      question.options.find((option) => option.isCorrect === shouldBeCorrect) ??
      question.options[0];

    return {
      questionId: question.id,
      selectedOptionId: selectedOption.id,
      isCorrect: selectedOption.isCorrect,
      createdAt: finishedAt,
    };
  });
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const totalQuestions = Math.max(questions.length, 1);

  return prisma.lessonAttempt.create({
    data: {
      userId,
      lessonId,
      score: Math.round((correctAnswers / totalQuestions) * 100),
      totalQuestions,
      correctAnswers,
      startedAt: new Date(finishedAt.getTime() - 8 * 60 * 1000),
      finishedAt,
      answers: {
        create: answers,
      },
    },
  });
}

async function upsertProgress(
  userId: string,
  lessonId: string,
  status: ProgressStatus,
  lastScore: number,
  completedAt: Date | null
) {
  return prisma.userProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    update: {
      status,
      lastScore,
      completedAt,
    },
    create: {
      userId,
      lessonId,
      status,
      lastScore,
      completedAt,
    },
  });
}

async function seedBadgesForDemoUser(userId: string, now: Date) {
  const badges = [
    {
      code: "first_lesson",
      title: "Bài học đầu tiên",
      description: "Hoàn thành bài học đầu tiên.",
      iconName: "school",
      criteriaType: BadgeCriteriaType.FIRST_LESSON,
      sortOrder: 1,
    },
    {
      code: "three_lessons",
      title: "Khởi đầu đều đặn",
      description: "Hoàn thành 3 bài học khác nhau.",
      iconName: "auto_stories",
      criteriaType: BadgeCriteriaType.THREE_LESSONS,
      sortOrder: 2,
    },
    {
      code: "perfect_score",
      title: "Điểm tuyệt đối",
      description: "Đạt 100% trong một bài quiz.",
      iconName: "verified",
      criteriaType: BadgeCriteriaType.PERFECT_SCORE,
      sortOrder: 3,
    },
    {
      code: "five_attempts",
      title: "Thói quen luyện tập",
      description: "Hoàn thành 5 lượt làm quiz.",
      iconName: "repeat",
      criteriaType: BadgeCriteriaType.FIVE_ATTEMPTS,
      sortOrder: 4,
    },
    {
      code: "seven_day_streak",
      title: "Chuỗi 7 ngày",
      description: "Học trong 7 ngày liên tiếp.",
      iconName: "local_fire_department",
      criteriaType: BadgeCriteriaType.SEVEN_DAY_STREAK,
      sortOrder: 5,
    },
  ];

  for (const badgeSeed of badges) {
    const badge = await prisma.badge.upsert({
      where: { code: badgeSeed.code },
      update: { ...badgeSeed, isActive: true },
      create: badgeSeed,
    });

    await prisma.userBadge.upsert({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
      update: {
        unlockedAt: now,
      },
      create: {
        userId,
        badgeId: badge.id,
        unlockedAt: now,
      },
    });
  }
}

async function seedDailyChallengeReadyToClaim(userId: string, now: Date) {
  const challenge = await prisma.dailyChallenge.upsert({
    where: { code: "complete_lessons_daily" },
    update: {
      title: "Hoàn thành bài học hôm nay",
      description: "Hoàn thành 3 bài học khác nhau để nhận XP thưởng.",
      type: DailyChallengeType.COMPLETE_LESSONS,
      target: 3,
      rewardXp: 20,
      sortOrder: 1,
      isActive: true,
    },
    create: {
      code: "complete_lessons_daily",
      title: "Hoàn thành bài học hôm nay",
      description: "Hoàn thành 3 bài học khác nhau để nhận XP thưởng.",
      type: DailyChallengeType.COMPLETE_LESSONS,
      target: 3,
      rewardXp: 20,
      sortOrder: 1,
    },
  });

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  await prisma.userChallenge.upsert({
    where: {
      userId_dailyChallengeId_challengeDate: {
        userId,
        dailyChallengeId: challenge.id,
        challengeDate: startOfToday,
      },
    },
    update: {
      progress: 3,
      isCompleted: true,
      completedAt: now,
      claimedAt: null,
    },
    create: {
      userId,
      dailyChallengeId: challenge.id,
      challengeDate: startOfToday,
      progress: 3,
      isCompleted: true,
      completedAt: now,
      claimedAt: null,
    },
  });
}

async function seedNotifications(users: Awaited<ReturnType<typeof seedUsers>>) {
  await prisma.notificationPreference.upsert({
    where: { userId: users.demo.id },
    update: {
      dailyReminderEnabled: true,
      streakReminderEnabled: true,
      reviewReminderEnabled: true,
      reminderHour: 20,
      timezone: "Asia/Bangkok",
      quietHoursStart: 22,
      quietHoursEnd: 7,
    },
    create: {
      userId: users.demo.id,
      dailyReminderEnabled: true,
      streakReminderEnabled: true,
      reviewReminderEnabled: true,
      reminderHour: 20,
      timezone: "Asia/Bangkok",
      quietHoursStart: 22,
      quietHoursEnd: 7,
    },
  });

  await prisma.deviceToken.upsert({
    where: { token: "demo-web-token-lexi" },
    update: {
      userId: users.demo.id,
      platform: DeviceTokenPlatform.WEB,
      deviceId: "demo-browser",
      appVersion: "demo",
      revokedAt: null,
      lastSeenAt: new Date(),
    },
    create: {
      userId: users.demo.id,
      token: "demo-web-token-lexi",
      platform: DeviceTokenPlatform.WEB,
      deviceId: "demo-browser",
      appVersion: "demo",
      lastSeenAt: new Date(),
    },
  });

  await upsertDeliveryLog({
    userId: users.demo.id,
    type: NotificationDeliveryType.DAILY_REMINDER,
    deliveryKey: "demo-daily-reminder",
    status: NotificationDeliveryStatus.SENT,
    title: "Đến giờ học LEXI",
    body: "Hoàn thành 3 bài để nhận XP hôm nay.",
    successCount: 1,
    failureCount: 0,
    deliveredAt: new Date(),
  });

  await upsertDeliveryLog({
    userId: users.demo.id,
    type: NotificationDeliveryType.REVIEW_REMINDER,
    deliveryKey: "demo-review-reminder",
    status: NotificationDeliveryStatus.PARTIAL,
    title: "Ôn lại câu đã sai",
    body: "Bạn có câu hỏi về nghỉ việc và phishing cần xem lại.",
    successCount: 1,
    failureCount: 1,
    deliveredAt: new Date(),
  });

  await upsertDeliveryLog({
    userId: users.leaderboardUsers[0].id,
    type: NotificationDeliveryType.STREAK_REMINDER,
    deliveryKey: "demo-streak-reminder",
    status: NotificationDeliveryStatus.FAILED,
    title: "Giữ chuỗi học tập",
    body: "Log gửi thất bại dùng để demo bộ lọc admin.",
    successCount: 0,
    failureCount: 1,
    deliveredAt: null,
  });

  console.log(
    "Notification preferences, device token and delivery logs seeded."
  );
}

async function upsertDeliveryLog(params: {
  userId: string;
  type: NotificationDeliveryType;
  deliveryKey: string;
  status: NotificationDeliveryStatus;
  title: string;
  body: string;
  successCount: number;
  failureCount: number;
  deliveredAt: Date | null;
}) {
  return prisma.notificationDeliveryLog.upsert({
    where: {
      userId_type_deliveryKey: {
        userId: params.userId,
        type: params.type,
        deliveryKey: params.deliveryKey,
      },
    },
    update: {
      status: params.status,
      title: params.title,
      body: params.body,
      successCount: params.successCount,
      failureCount: params.failureCount,
      deliveredAt: params.deliveredAt,
      data: { seed: "demo" },
    },
    create: {
      userId: params.userId,
      type: params.type,
      deliveryKey: params.deliveryKey,
      status: params.status,
      title: params.title,
      body: params.body,
      successCount: params.successCount,
      failureCount: params.failureCount,
      deliveredAt: params.deliveredAt,
      data: { seed: "demo" },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
