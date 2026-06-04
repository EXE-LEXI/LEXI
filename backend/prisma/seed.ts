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
  await seedCommunityPosts(users);

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
    // === NEW LESSONS ===
    // --- LUẬT LAO ĐỘNG ---
    {
      moduleId: modules.laborContract.id,
      slug: "bao-hiem-xa-hoi-bat-buoc",
      title: "Bảo hiểm xã hội bắt buộc",
      content: "Bảo hiểm xã hội bắt buộc là chế độ bảo hiểm của Nhà nước nhằm bảo đảm thay thế hoặc bù đắp một phần thu nhập của người lao động khi bị giảm hoặc mất thu nhập do ốm đau, thai sản, tai nạn lao động, bệnh nghề nghiệp, hết tuổi lao động hoặc chết, trên cơ sở đóng vào quỹ bảo hiểm xã hội.",
      sourceTitle: "Luật Bảo hiểm xã hội 2014",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=39589",
      legalDocumentNo: "58/2014/QH13",
      effectiveDate: new Date("2016-01-01T00:00:00.000Z"),
      reviewerNote: "Bổ sung kiến thức về tỷ lệ đóng bảo hiểm và chế độ thai sản, hưu trí.",
      sortOrder: 3,
      questions: [],
    },
    {
      moduleId: modules.laborContract.id,
      slug: "ky-luat-lao-dong-sa-thai",
      title: "Kỷ luật lao động và sa thải",
      content: "Kỷ luật lao động là những quy định về việc tuân theo thời gian, công nghệ và điều hành sản xuất, kinh doanh trong nội quy lao động. Người sử dụng lao động có quyền xử lý kỷ luật lao động đối với người lao động có hành vi vi phạm bằng các hình thức: khiển trách, kéo dài thời hạn nâng lương, cách chức, sa thải đúng quy trình pháp luật.",
      sourceTitle: "Bộ luật Lao động 2019",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=137155#dieu124",
      legalDocumentNo: "45/2019/QH14",
      effectiveDate: new Date("2021-01-01T00:00:00.000Z"),
      reviewerNote: "Lưu ý các trường hợp sa thải trái luật sẽ dẫn đến bồi thường lớn.",
      sortOrder: 4,
      questions: [],
    },
    {
      moduleId: modules.laborLeave.id,
      slug: "lam-them-gio-va-luong",
      title: "Làm thêm giờ và tiền lương làm thêm",
      content: "Thời gian làm thêm giờ là khoảng thời gian làm việc ngoài thời giờ làm việc bình thường. Tổng số giờ làm thêm không quá 50% số giờ làm việc bình thường trong 01 ngày, không quá 40 giờ trong 01 tháng và không quá 200 giờ trong 01 năm (một số ngành đặc thù được tối đa 300 giờ). Tiền lương làm thêm được tính ít nhất bằng 150% vào ngày thường, 200% vào ngày nghỉ hằng tuần, và 300% vào ngày lễ, tết.",
      sourceTitle: "Bộ luật Lao động 2019",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=137155#dieu107",
      legalDocumentNo: "45/2019/QH14",
      effectiveDate: new Date("2021-01-01T00:00:00.000Z"),
      reviewerNote: "Quy định quan trọng bảo vệ sức lao động và thu nhập tăng thêm.",
      sortOrder: 2,
      questions: [],
    },
    {
      moduleId: modules.laborLeave.id,
      slug: "lao-dong-nu-thai-san",
      title: "Quyền lợi của lao động nữ thai sản",
      content: "Lao động nữ được nghỉ khám thai 05 lần, mỗi lần 01 ngày. Thời gian nghỉ sinh con là 06 tháng (nếu sinh đôi trở lên thì từ con thứ hai, cứ mỗi con được nghỉ thêm 01 tháng). Trong thời gian nghỉ thai sản, người lao động được hưởng trợ cấp thai sản bằng 100% mức bình quân tiền lương tháng đóng BHXH của 06 tháng trước khi nghỉ.",
      sourceTitle: "Luật Bảo hiểm xã hội 2014",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=39589#dieu34",
      legalDocumentNo: "58/2014/QH13",
      effectiveDate: new Date("2016-01-01T00:00:00.000Z"),
      reviewerNote: "Bảo vệ bà mẹ và trẻ em, giữ nguyên việc làm sau khi quay lại.",
      sortOrder: 3,
      questions: [],
    },
    {
      moduleId: modules.laborLeave.id,
      slug: "tranh-chap-lao-dong",
      title: "Tranh chấp lao động và cách giải quyết",
      content: "Tranh chấp lao động là tranh chấp về quyền, nghĩa vụ và lợi ích phát sinh giữa các bên trong quan hệ lao động. Cơ quan, tổ chức có thẩm quyền giải quyết tranh chấp lao động cá nhân gồm: Hòa giải viên lao động; Hội đồng trọng tài lao động; Tòa án nhân dân.",
      sourceTitle: "Bộ luật Lao động 2019",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=137155#dieu179",
      legalDocumentNo: "45/2019/QH14",
      effectiveDate: new Date("2021-01-01T00:00:00.000Z"),
      reviewerNote: "Quy trình hòa giải là bắt buộc trước khi đưa ra Tòa án đối với hầu hết các tranh chấp.",
      sortOrder: 4,
      questions: [],
    },

    // --- LUẬT GIAO THÔNG ---
    {
      moduleId: modules.trafficBasics.id,
      slug: "nong-do-con-khi-lai-xe",
      title: "Xử phạt nồng độ cồn khi lái xe",
      content: "Luật Phòng, chống tác hại của rượu, bia nghiêm cấm hoàn toàn hành vi điều khiển phương tiện giao thông đường bộ mà trong máu hoặc hơi thở có nồng độ cồn. Mức phạt tiền cao nhất đối với ô tô là 40 triệu đồng và tước GPLX đến 24 tháng; đối với xe máy là 8 triệu đồng và tước GPLX đến 24 tháng.",
      sourceTitle: "Luật Phòng, chống tác hại của rượu, bia 2019",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=135898",
      legalDocumentNo: "44/2019/QH14",
      effectiveDate: new Date("2020-01-01T00:00:00.000Z"),
      reviewerNote: "Quy định không cồn tuyệt đối nhằm giảm tai nạn giao thông.",
      sortOrder: 2,
      questions: [],
    },
    {
      moduleId: modules.trafficBasics.id,
      slug: "vuot-den-do-hieu-lenh",
      title: "Vượt đèn đỏ và chấp hành hiệu lệnh",
      content: "Người tham gia giao thông phải chấp hành hệ thống báo hiệu đường bộ theo thứ tự ưu tiên: 1. Hiệu lệnh của người điều khiển giao thông; 2. Hiệu lệnh của đèn tín hiệu; 3. Hiệu lệnh của biển báo; 4. Vạch kẻ đường. Hành vi vượt đèn đỏ, đèn vàng bị xử phạt nghiêm khắc và tước GPLX có thời hạn.",
      sourceTitle: "Luật Giao thông đường bộ 2008",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=23971",
      legalDocumentNo: "23/2008/QH12",
      effectiveDate: new Date("2009-07-01T00:00:00.000Z"),
      reviewerNote: "Đèn vàng báo hiệu phải dừng trước vạch dừng, trừ trường hợp đã đi quá vạch.",
      sortOrder: 3,
      questions: [],
    },
    {
      moduleId: modules.trafficBasics.id,
      slug: "di-nguoc-chieu-sai-lan",
      title: "Lỗi đi ngược chiều và đi sai làn đường",
      content: "Đi sai làn đường là đi không đúng làn đường dành cho phương tiện đó trên đường có nhiều làn xe. Đi ngược chiều là đi vào đường có biển cấm đi ngược chiều hoặc đi ngược chiều của đường một chiều. Cả hai hành vi đều cực kỳ nguy hiểm và bị xử phạt nặng.",
      sourceTitle: "Nghị định xử phạt vi phạm giao thông đường bộ",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=139616",
      legalDocumentNo: "100/2019/ND-CP",
      effectiveDate: new Date("2020-01-01T00:00:00.000Z"),
      reviewerNote: "Phân biệt rõ lỗi đi sai làn đường và lỗi không chấp hành vạch kẻ đường.",
      sortOrder: 4,
      questions: [],
    },
    {
      moduleId: modules.trafficPapers.id,
      slug: "doi-mu-bao-hiem-quy-dinh",
      title: "Đội mũ bảo hiểm đúng quy định",
      content: "Người điều khiển, người ngồi trên xe mô tô hai bánh, xe mô tô ba bánh, xe gắn máy, xe máy điện phải đội mũ bảo hiểm cho người đi mô tô, xe máy có cài quai đúng quy cách khi tham gia giao thông đường bộ. Trẻ em từ đủ 06 tuổi trở lên cũng bắt buộc phải đội mũ bảo hiểm.",
      sourceTitle: "Luật Giao thông đường bộ 2008",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=23971#dieu30",
      legalDocumentNo: "23/2008/QH12",
      effectiveDate: new Date("2009-07-01T00:00:00.000Z"),
      reviewerNote: "Đội mũ không cài quai hoặc mũ không đạt chuẩn chất lượng vẫn bị phạt như lỗi không đội mũ bảo hiểm.",
      sortOrder: 2,
      questions: [],
    },
    {
      moduleId: modules.trafficPapers.id,
      slug: "xe-khong-chinh-chu",
      title: "Đi xe không chính chủ và sang tên",
      content: "Pháp luật không xử phạt việc mượn xe của người thân, bạn bè đi đường. Lỗi 'không làm thủ tục đăng ký sang tên xe' (hay gọi là xe không chính chủ) chỉ bị kiểm tra và xử phạt qua công tác điều tra giải quyết tai nạn giao thông hoặc đăng ký sang tên di chuyển xe.",
      sourceTitle: "Nghị định xử phạt vi phạm giao thông đường bộ",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=139616#dieu80",
      legalDocumentNo: "100/2019/ND-CP",
      effectiveDate: new Date("2020-01-01T00:00:00.000Z"),
      reviewerNote: "Thời hạn làm thủ tục sang tên xe là 30 ngày kể từ ngày làm chứng từ chuyển quyền sở hữu.",
      sortOrder: 3,
      questions: [],
    },
    {
      moduleId: modules.trafficPapers.id,
      slug: "nhuong-duong-nga-tu",
      title: "Quy tắc nhường đường tại ngã tư",
      content: "Tại nơi đường giao nhau không có vòng xuyến, phải nhường đường cho xe đi đến từ bên phải. Tại nơi giao nhau có vòng xuyến, phải nhường đường cho xe đi bên trái. Xe từ đường ngõ, đường nhánh phải nhường đường cho xe đang đi trên đường ưu tiên hoặc đường chính từ bất kỳ hướng nào tới.",
      sourceTitle: "Luật Giao thông đường bộ 2008",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=23971#dieu24",
      legalDocumentNo: "23/2008/QH12",
      effectiveDate: new Date("2009-07-01T00:00:00.000Z"),
      reviewerNote: "Nhường đường đúng luật giúp hạn chế ùn tắc và va quệt tại giao lộ.",
      sortOrder: 4,
      questions: [],
    },

    // --- AN TOÀN SỐ ---
    {
      moduleId: modules.antiScam.id,
      slug: "bao-mat-mang-xa-hoi",
      title: "Bảo mật tài khoản mạng xã hội",
      content: "Bảo mật tài khoản Facebook, Zalo, Telegram đòi hỏi kích hoạt bảo mật hai lớp (2FA), cài đặt cảnh báo đăng nhập lạ, kiểm soát danh sách ứng dụng liên kết và thiết lập mật khẩu khóa ứng dụng để tránh bị chiếm quyền kiểm soát.",
      sourceTitle: "Khuyến nghị bảo mật tài khoản mạng xã hội",
      sourceUrl: "https://khonggianmang.vn/social-safety",
      legalDocumentNo: "CSIRT-SOCIAL-01",
      effectiveDate: new Date("2024-01-01T00:00:00.000Z"),
      reviewerNote: "Tuyệt đối không click vào các link lạ nhận từ bạn bè đang bị nghi ngờ hack tài khoản.",
      sortOrder: 2,
      questions: [],
    },
    {
      moduleId: modules.antiScam.id,
      slug: "canh-giac-phan-mem-doc-hai",
      title: "Cảnh giác phần mềm độc hại (Malware)",
      content: "Phần mềm độc hại (Malware) bao gồm virus, trojan, spyware, adware và ransomware. Chúng lây nhiễm qua email spam, link tải phần mềm lậu, crack, hoặc thiết bị ngoại vi nhiễm độc nhằm theo dõi, lấy cắp dữ liệu hoặc mã hóa tống tiền.",
      sourceTitle: "Hướng dẫn nhận diện và phòng tránh phần mềm độc hại",
      sourceUrl: "https://khonggianmang.vn/malware-prevention",
      legalDocumentNo: "CSIRT-MALWARE-01",
      effectiveDate: new Date("2024-01-01T00:00:00.000Z"),
      reviewerNote: "Sử dụng phần mềm diệt virus có bản quyền và cập nhật hệ điều hành thường xuyên.",
      sortOrder: 3,
      questions: [],
    },
    {
      moduleId: modules.antiScam.id,
      slug: "sao-luu-du-lieu-ransomware",
      title: "Sao lưu dữ liệu phòng chống Ransomware",
      content: "Mã hóa tống tiền (Ransomware) tấn công hệ thống và khóa toàn bộ dữ liệu quan trọng để đòi tiền chuộc. Cách bảo vệ tốt nhất là thực hiện quy tắc sao lưu 3-2-1: 3 bản sao lưu, lưu trên 2 loại phương tiện khác nhau, và 1 bản lưu ngoại tuyến (Offline/Cold Backup).",
      sourceTitle: "Khuyến nghị ứng phó sự cố mã hóa tống tiền",
      sourceUrl: "https://khonggianmang.vn/ransomware-backup",
      legalDocumentNo: "CSIRT-RANSOM-01",
      effectiveDate: new Date("2024-01-01T00:00:00.000Z"),
      reviewerNote: "Nếu bị nhiễm ransomware, tuyệt đối không vội thanh toán tiền chuộc vì không có gì bảo đảm kẻ xấu sẽ trả lại khóa giải mã.",
      sortOrder: 4,
      questions: [],
    },
    {
      moduleId: modules.accountSafety.id,
      slug: "bao-ve-thong-tin-ca-nhan",
      title: "Bảo vệ thông tin cá nhân trên mạng",
      content: "Dữ liệu cá nhân (số điện thoại, CCCD, ảnh chân dung, thông tin tài chính) bị thu thập trái phép để quảng cáo rác, lừa đảo giả danh hoặc mở tài khoản ngân hàng ảo. Người dùng nên hạn chế công khai các thông tin này trên mạng xã hội.",
      sourceTitle: "Luật An toàn thông tin mạng 2015",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=96123",
      legalDocumentNo: "86/2015/QH13",
      effectiveDate: new Date("2016-07-01T00:00:00.000Z"),
      reviewerNote: "Quy định bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP siết chặt việc xử lý thông tin cá nhân trái phép.",
      sortOrder: 2,
      questions: [],
    },
    {
      moduleId: modules.accountSafety.id,
      slug: "wifi-cong-cong-an-toan",
      title: "Sử dụng mạng Wifi công cộng an toàn",
      content: "Wifi công cộng tại quán cà phê, sân bay không được mã hóa, dễ bị kẻ xấu tấn công chặn bắt dữ liệu (Man-in-the-Middle) để lấy cắp tài khoản đăng nhập. Nên tránh giao dịch ngân hàng, mua sắm trực tuyến khi kết nối Wifi công cộng.",
      sourceTitle: "Khuyến nghị an toàn khi sử dụng mạng không dây công cộng",
      sourceUrl: "https://khonggianmang.vn/public-wifi-safety",
      legalDocumentNo: "CSIRT-WIFI-01",
      effectiveDate: new Date("2024-01-01T00:00:00.000Z"),
      reviewerNote: "Sử dụng mạng 3G/4G hoặc kích hoạt VPN để mã hóa đường truyền dữ liệu.",
      sortOrder: 3,
      questions: [],
    },
    {
      moduleId: modules.accountSafety.id,
      slug: "quyen-rieng-tu-chia-se-anh",
      title: "Quyền riêng tư và chia sẻ ảnh trẻ em",
      content: "Việc đăng tải hình ảnh, thông tin trường lớp, kết quả học tập của trẻ em lên mạng xã hội tiềm ẩn nguy cơ mất an toàn cho trẻ. Luật Trẻ em nghiêm cấm hành vi công bố, tiết lộ thông tin về đời sống riêng tư, bí mật cá nhân của trẻ em mà không được sự đồng ý của cha mẹ hoặc trẻ em từ đủ 7 tuổi.",
      sourceTitle: "Luật Trẻ em 2016",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=110300",
      legalDocumentNo: "102/2016/QH13",
      effectiveDate: new Date("2017-06-01T00:00:00.000Z"),
      reviewerNote: "Bảo vệ bí mật cá nhân của trẻ em trên không gian mạng là nghĩa vụ pháp lý của cha mẹ.",
      sortOrder: 4,
      questions: [],
    },

    // --- LỪA ĐẢO ONLINE ---
    {
      moduleId: modules.scamInvestment.id,
      slug: "lua-dao-tuyen-dung-viec-nhe",
      title: "Lừa đảo tuyển dụng việc nhẹ lương cao",
      content: "Kẻ lừa đảo tuyển 'Cộng tác viên xử lý đơn hàng' cho Shopee, Lazada, hoặc thả tim TikTok nhận tiền. Ban đầu họ trả hoa hồng thật đầy đủ cho đơn hàng nhỏ, sau đó yêu cầu nạp số tiền lớn để làm nhiệm vụ giá trị cao rồi giam tiền và biến mất.",
      sourceTitle: "Cảnh báo lừa đảo tuyển dụng qua mạng",
      sourceUrl: "https://lexi.local/sources/lua-dao-tuyen-dung",
      legalDocumentNo: "DEMO-SCAM-03",
      effectiveDate: new Date("2026-01-01T00:00:00.000Z"),
      reviewerNote: "Không có công việc nào chỉ cần ngồi click chuột mà nhận hoa hồng hàng triệu đồng mỗi ngày.",
      sortOrder: 2,
      questions: [],
    },
    {
      moduleId: modules.scamInvestment.id,
      slug: "lua-dao-tinh-cam-dau-tu",
      title: "Bẫy lừa đảo tình cảm rồi dụ đầu tư",
      content: "Kẻ lừa đảo tạo tài khoản ảo đẹp đẽ trên app hẹn hò (Tinder, Bumble), kết bạn làm quen, thể hiện tình cảm lãng mạn. Sau khi tạo dựng lòng tin, họ giới thiệu mình có nguồn tin mật đầu tư chứng khoán, tiền ảo chắc chắn thắng và dụ nạn nhân nạp tiền.",
      sourceTitle: "Cảnh báo lừa đảo tình ái trực tuyến (Romance Scam)",
      sourceUrl: "https://lexi.local/sources/romance-scam",
      legalDocumentNo: "DEMO-SCAM-04",
      effectiveDate: new Date("2026-01-01T00:00:00.000Z"),
      reviewerNote: "Cảnh giác với những người quen qua mạng chưa từng gặp mặt trực tiếp ngoài đời nhưng chủ động nói về đầu tư tiền bạc.",
      sortOrder: 3,
      questions: [],
    },
    {
      moduleId: modules.scamShopping.id,
      slug: "gia-danh-co-quan-chuc-nang",
      title: "Giả danh cơ quan công an, viện kiểm sát",
      content: "Kẻ lừa đảo gọi điện tự xưng là cán bộ Công an, Viện kiểm sát, Tòa án thông báo nạn nhân liên quan đến đường dây buôn lậu ma túy, rửa tiền. Chúng đe dọa lệnh bắt giam và yêu cầu chuyển tiền vào tài khoản tạm giữ của cơ quan điều tra để chứng minh trong sạch.",
      sourceTitle: "Cảnh báo giả danh cơ quan pháp luật lừa đảo",
      sourceUrl: "https://lexi.local/sources/gia-danh-cong-an",
      legalDocumentNo: "DEMO-SCAM-05",
      effectiveDate: new Date("2026-01-01T00:00:00.000Z"),
      reviewerNote: "Cơ quan công an, viện kiểm sát tuyệt đối không làm việc qua điện thoại và không bao giờ yêu cầu người dân chuyển tiền vào tài khoản cá nhân.",
      sortOrder: 2,
      questions: [],
    },
    {
      moduleId: modules.scamShopping.id,
      slug: "lua-dao-hack-muon-tien",
      title: "Lừa đảo hack tài khoản rồi mượn tiền",
      content: "Kẻ xấu hack facebook, zalo của nạn nhân hoặc tạo tài khoản mạo danh giống hệt. Chúng nhắn tin cho bạn bè, người thân trong danh sách liên lạc nhờ chuyển khoản gấp để giải quyết công việc, mua thẻ cào, hoặc nhờ thanh toán đơn hàng hộ.",
      sourceTitle: "Cảnh báo chiếm quyền điều khiển mạng xã hội lừa đảo",
      sourceUrl: "https://lexi.local/sources/hack-muon-tien",
      legalDocumentNo: "DEMO-SCAM-06",
      effectiveDate: new Date("2026-01-01T00:00:00.000Z"),
      reviewerNote: "Luôn luôn gọi điện trực tiếp (bằng cuộc gọi thường hoặc gọi video) để xác minh danh tính trước khi chuyển khoản cho bất kỳ ai.",
      sortOrder: 3,
      questions: [],
    },
    {
      moduleId: modules.scamShopping.id,
      slug: "nhan-qua-mien-phi-dong-coc",
      title: "Chiêu trò nhận quà miễn phí đóng cọc",
      content: "Nạn nhân nhận được tin nhắn thông báo trúng thưởng tri ân xe máy, điện thoại hoặc được tặng bộ mỹ phẩm miễn phí. Kẻ xấu yêu cầu thanh toán trước phí vận chuyển, phí làm hồ sơ hoặc đóng tiền thuế thu nhập cá nhân giải thưởng vào tài khoản cá nhân.",
      sourceTitle: "Cảnh báo lừa đảo trúng thưởng, nhận quà miễn phí",
      sourceUrl: "https://lexi.local/sources/nhan-qua-mien-phi",
      legalDocumentNo: "DEMO-SCAM-07",
      effectiveDate: new Date("2026-01-01T00:00:00.000Z"),
      reviewerNote: "Các chương trình khuyến mãi trúng thưởng chính thức đều phải đăng ký với Bộ Công Thương và không thu phí trước của khách hàng qua tài khoản cá nhân.",
      sortOrder: 4,
      questions: [],
    },

    // --- BẢO VỆ NGƯỜI TIÊU DÙNG ---
    {
      moduleId: modules.shopping.id,
      slug: "mua-nham-hang-gia-nhai",
      title: "Quyền lợi khi mua nhầm hàng giả, nhái",
      content: "Khi phát hiện hàng hóa mua sắm là hàng giả, hàng nhái nhãn hiệu, người tiêu dùng có quyền yêu cầu người bán đổi trả, hoàn tiền hoặc bồi thường thiệt hại. Người kinh doanh hàng giả có thể bị phạt hành chính nặng hoặc bị truy cứu trách nhiệm hình sự.",
      sourceTitle: "Luật Bảo vệ quyền lợi người tiêu dùng 2023",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=161111",
      legalDocumentNo: "19/2023/QH15",
      effectiveDate: new Date("2024-07-01T00:00:00.000Z"),
      reviewerNote: "Người tiêu dùng có nghĩa vụ thông tin cho cơ quan nhà nước khi phát hiện hàng giả lưu thông trên thị trường.",
      sortOrder: 2,
      questions: [],
    },
    {
      moduleId: modules.shopping.id,
      slug: "bao-ve-thong-tin-nguoi-dung",
      title: "Bảo vệ thông tin người tiêu dùng",
      content: "Tổ chức, cá nhân kinh doanh phải bảo đảm an toàn, bí mật thông tin của người tiêu dùng; không được thu thập, sử dụng, chuyển giao thông tin của người tiêu dùng cho bên thứ ba khi chưa được sự đồng ý của họ, trừ trường hợp pháp luật có quy định khác.",
      sourceTitle: "Luật Bảo vệ quyền lợi người tiêu dùng 2023",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=161111#dieu15",
      legalDocumentNo: "19/2023/QH15",
      effectiveDate: new Date("2024-07-01T00:00:00.000Z"),
      reviewerNote: "Tránh cung cấp bừa bãi thông tin số điện thoại tại các quầy thu ngân siêu thị nếu không thực sự cần thiết.",
      sortOrder: 3,
      questions: [],
    },
    {
      moduleId: modules.warranty.id,
      slug: "doc-nhan-mac-han-su-dung",
      title: "Cách đọc nhãn mác, thời hạn sử dụng",
      content: "Nhãn hàng hóa bắt buộc phải ghi rõ: Tên hàng hóa; Tên và địa chỉ của tổ chức, cá nhân chịu trách nhiệm về hàng hóa; Xuất xứ hàng hóa; Ngày sản xuất và Hạn sử dụng. Đối với thực phẩm, việc sử dụng sản phẩm quá hạn có thể gây ảnh hưởng nghiêm trọng đến sức khỏe.",
      sourceTitle: "Nghị định về nhãn hàng hóa",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=120391",
      legalDocumentNo: "43/2017/ND-CP",
      effectiveDate: new Date("2017-06-01T00:00:00.000Z"),
      reviewerNote: "Lưu ý ký hiệu EXP (Expiry Date) là hạn sử dụng, MFG (Manufacturing Date) là ngày sản xuất.",
      sortOrder: 2,
      questions: [],
    },
    {
      moduleId: modules.warranty.id,
      slug: "khieu-nai-ve-sinh-an-toan",
      title: "Khiếu nại về dịch vụ ăn uống mất vệ sinh",
      content: "Cơ sở kinh doanh dịch vụ ăn uống có nghĩa vụ bảo đảm an toàn thực phẩm. Nếu người tiêu dùng phát hiện đồ ăn chứa dị vật (ruồi, gián, mảnh thủy tinh) hoặc bị ngộ độc thực phẩm, họ có quyền khiếu nại trực tiếp cơ sở, yêu cầu bồi thường chi phí y tế và báo cáo cơ quan quản lý ATTP.",
      sourceTitle: "Luật An toàn thực phẩm 2010",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=25841",
      legalDocumentNo: "55/2010/QH12",
      effectiveDate: new Date("2011-07-01T00:00:00.000Z"),
      reviewerNote: "Cần giữ lại hóa đơn thanh toán, mẫu thức ăn lỗi hoặc bệnh án ngộ độc thực phẩm để làm chứng cứ khiếu nại.",
      sortOrder: 3,
      questions: [],
    },
    {
      moduleId: modules.warranty.id,
      slug: "hop-dong-theo-mau-bat-loi",
      title: "Hợp đồng theo mẫu và điều khoản bất lợi",
      content: "Hợp đồng theo mẫu là hợp đồng do tổ chức, cá nhân kinh doanh biên soạn sẵn để giao dịch với người tiêu dùng. Luật quy định các điều khoản trong hợp đồng theo mẫu không được phép hạn chế quyền khiếu nại, khởi kiện của người tiêu dùng hoặc đơn phương loại trừ trách nhiệm của bên bán.",
      sourceTitle: "Luật Bảo vệ quyền lợi người tiêu dùng 2023",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=161111#dieu25",
      legalDocumentNo: "19/2023/QH15",
      effectiveDate: new Date("2024-07-01T00:00:00.000Z"),
      reviewerNote: "Đặc biệt cảnh giác với các hợp đồng thẻ tập gym, mua nhà chung cư có nhiều điều khoản phạt vi phạm đơn phương.",
      sortOrder: 4,
      questions: [],
    },
  ];

  const lessons: Record<
    string,
    Awaited<ReturnType<typeof prisma.lesson.upsert>>
  > = {};
  for (const seed of lessonSeeds) {
    lessons[seed.slug] = await upsertLesson(seed);
    const finalQuestions = getExtendedQuestions(seed.slug, seed.questions);
    await replaceLessonQuestions(lessons[seed.slug].id, finalQuestions);
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
  const day1Ago = daysAgo(now, 1, 19);
  const day2Ago = daysAgo(now, 2, 19);
  const day3Ago = daysAgo(now, 3, 19);
  const day4Ago = daysAgo(now, 4, 19);
  const day5Ago = daysAgo(now, 5, 19);
  const day6Ago = daysAgo(now, 6, 19);

  // --- KHÓA 1: LUẬT LAO ĐỘNG ---
  // Bài 1: Hoàn thành 6 ngày trước (thu-viec-toi-da-bao-lau)
  await recordAttempt(users.demo.id, content.lessons["thu-viec-toi-da-bao-lau"].id, Array(10).fill(true), day6Ago);
  await upsertProgress(users.demo.id, content.lessons["thu-viec-toi-da-bao-lau"].id, ProgressStatus.COMPLETED, 100, day6Ago);

  // Bài 2: Hoàn thành 5 ngày trước (don-phuong-cham-dut-hop-dong)
  await recordAttempt(users.demo.id, content.lessons["don-phuong-cham-dut-hop-dong"].id, Array(10).fill(true), day5Ago);
  await upsertProgress(users.demo.id, content.lessons["don-phuong-cham-dut-hop-dong"].id, ProgressStatus.COMPLETED, 100, day5Ago);

  // Bài 3: Hoàn thành 4 ngày trước (bao-hiem-xa-hoi-bat-buoc)
  await recordAttempt(users.demo.id, content.lessons["bao-hiem-xa-hoi-bat-buoc"].id, Array(10).fill(true), day4Ago);
  await upsertProgress(users.demo.id, content.lessons["bao-hiem-xa-hoi-bat-buoc"].id, ProgressStatus.COMPLETED, 100, day4Ago);

  // Bài 4: Hoàn thành 3 ngày trước (ky-luat-lao-dong-sa-thai)
  await recordAttempt(users.demo.id, content.lessons["ky-luat-lao-dong-sa-thai"].id, Array(10).fill(true), day3Ago);
  await upsertProgress(users.demo.id, content.lessons["ky-luat-lao-dong-sa-thai"].id, ProgressStatus.COMPLETED, 100, day3Ago);

  // Bài 5: Đang học hôm nay (nghi-phep-nam)
  const partialAnswersLaoDong = [true, false, true, false, true, false, true, false, true, false];
  await recordAttempt(users.demo.id, content.lessons["nghi-phep-nam"].id, partialAnswersLaoDong, today9);
  await upsertProgress(users.demo.id, content.lessons["nghi-phep-nam"].id, ProgressStatus.IN_PROGRESS, 50, null);

  // --- KHÓA 2: LUẬT GIAO THÔNG ---
  // Bài 1: Hoàn thành 2 ngày trước (toc-do-trong-khu-dan-cu)
  await recordAttempt(users.demo.id, content.lessons["toc-do-trong-khu-dan-cu"].id, Array(10).fill(true), day2Ago);
  await upsertProgress(users.demo.id, content.lessons["toc-do-trong-khu-dan-cu"].id, ProgressStatus.COMPLETED, 100, day2Ago);

  // Bài 2: Hoàn thành 1 ngày trước (nong-do-con-khi-lai-xe)
  await recordAttempt(users.demo.id, content.lessons["nong-do-con-khi-lai-xe"].id, Array(10).fill(true), day1Ago);
  await upsertProgress(users.demo.id, content.lessons["nong-do-con-khi-lai-xe"].id, ProgressStatus.COMPLETED, 100, day1Ago);

  // Bài 3: Đang học hôm nay (vuot-den-do-hieu-lenh)
  const partialAnswersGiaoThong = [true, false, true, false, true, false, true, false, true, false];
  await recordAttempt(users.demo.id, content.lessons["vuot-den-do-hieu-lenh"].id, partialAnswersGiaoThong, today10);
  await upsertProgress(users.demo.id, content.lessons["vuot-den-do-hieu-lenh"].id, ProgressStatus.IN_PROGRESS, 50, null);

  // --- KHÓA 3: AN TOÀN SỐ ---
  // Bài 1: Đang học hôm nay (nhan-dien-link-phishing)
  const partialAnswersAnToanSo = [true, false, true, false, true, false, true, false, true, false];
  await recordAttempt(users.demo.id, content.lessons["nhan-dien-link-phishing"].id, partialAnswersAnToanSo, today11);
  await upsertProgress(users.demo.id, content.lessons["nhan-dien-link-phishing"].id, ProgressStatus.IN_PROGRESS, 50, null);

  // --- KHÓA 4: LỪA ĐẢO ONLINE ---
  // Bài 1: Đang học hôm nay (nhan-dien-app-dau-tu-gia-mao)
  const partialAnswersLuaDao = [true, false, true, false, true, false, true, false, true, false];
  await recordAttempt(users.demo.id, content.lessons["nhan-dien-app-dau-tu-gia-mao"].id, partialAnswersLuaDao, today11);
  await upsertProgress(users.demo.id, content.lessons["nhan-dien-app-dau-tu-gia-mao"].id, ProgressStatus.IN_PROGRESS, 50, null);

  // --- KHÓA 5: BẢO VỆ NGƯỜI TIÊU DÙNG ---
  // Bài 1: Đang học hôm nay (doi-tra-khi-mua-hang-online)
  const partialAnswersNguoiTieuDung = [true, false, true, false, true, false, true, false, true, false];
  await recordAttempt(users.demo.id, content.lessons["doi-tra-khi-mua-hang-online"].id, partialAnswersNguoiTieuDung, today11);
  await upsertProgress(users.demo.id, content.lessons["doi-tra-khi-mua-hang-online"].id, ProgressStatus.IN_PROGRESS, 50, null);

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

function getExtendedQuestions(slug: string, defaultQuestions: QuizSeed[]): QuizSeed[] {
  switch (slug) {
    case "thu-viec-toi-da-bao-lau":
      return [
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
        quiz(
          "Vị trí quản lý doanh nghiệp theo Luật Doanh nghiệp có thể thử việc tối đa bao lâu?",
          "Người quản lý doanh nghiệp có thể thử việc tối đa 180 ngày theo Bộ luật Lao động 2019.",
          ["60 ngày", "90 ngày", "120 ngày", "180 ngày"],
          3
        ),
        quiz(
          "Công việc cần trình độ trung cấp, công nhân kỹ thuật thử việc tối đa bao lâu?",
          "Đối với công việc có chức danh nghề nghiệp cần trình độ trung cấp, công nhân kỹ thuật, thời gian thử việc tối đa là 30 ngày.",
          ["30 ngày", "60 ngày", "90 ngày", "180 ngày"],
          0
        ),
        quiz(
          "Các công việc khác (như lao động phổ thông) thử việc tối đa mấy ngày làm việc?",
          "Đối với các công việc khác không yêu cầu trình độ kỹ thuật cao, thời gian thử việc tối đa là 6 ngày làm việc.",
          ["6 ngày", "10 ngày", "15 ngày", "30 ngày"],
          0
        ),
        quiz(
          "Người lao động giao kết hợp đồng lao động dưới 01 tháng có được áp dụng thử việc không?",
          "Bộ luật Lao động cấm áp dụng thử việc đối với người lao động giao kết hợp đồng lao động dưới 01 tháng.",
          ["Có", "Không", "Tùy thỏa thuận", "Chỉ áp dụng 3 ngày"],
          1
        ),
        quiz(
          "Trong thời gian thử việc, việc hủy bỏ thỏa thuận thử việc được quy định thế nào?",
          "Mỗi bên có quyền huỷ bỏ thoả thuận thử việc mà không cần báo trước và không phải bồi thường nếu việc làm thử không đạt yêu cầu.",
          ["Không báo trước và không bồi thường", "Báo trước 3 ngày", "Báo trước 15 ngày", "Phải bồi thường nửa tháng lương"],
          0
        ),
        quiz(
          "Khi kết thúc thời gian thử việc đạt yêu cầu, người sử dụng lao động phải làm gì?",
          "Khi thử việc đạt yêu cầu, người sử dụng lao động phải giao kết hợp đồng lao động với người lao động ngay.",
          ["Ký hợp đồng ngay", "Tiếp tục thử việc lần 2", "Cho nghỉ việc tự do", "Giảm lương"],
          0
        ),
        quiz(
          "Người lao động được thử việc tối đa mấy lần cho một công việc?",
          "Chỉ được thử việc 01 lần đối với một công việc theo quy định.",
          ["1 lần", "2 lần", "Không giới hạn", "Tùy vào kết quả công việc"],
          0
        ),
        quiz(
          "Người sử dụng lao động thử việc quá thời gian hoặc trả lương dưới 85% có bị xử phạt không?",
          "Có, người sử dụng lao động vi phạm sẽ bị xử phạt tiền hành chính và buộc trả đủ 100% lương cho người lao động.",
          ["Không bị phạt", "Chỉ bị nhắc nhở", "Có bị phạt tiền và buộc trả đủ lương", "Chỉ bị phạt cảnh cáo"],
          2
        ),
      ];
    case "don-phuong-cham-dut-hop-dong":
      return [
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
        quiz(
          "Người lao động làm việc theo HĐLĐ không xác định thời hạn muốn nghỉ việc phải báo trước bao nhiêu ngày?",
          "Người lao động phải báo trước ít nhất 45 ngày đối với HĐLĐ không xác định thời hạn.",
          ["15 ngày", "30 ngày", "45 ngày", "60 ngày"],
          2
        ),
        quiz(
          "Người lao động ký HĐLĐ xác định thời hạn từ 12 đến 36 tháng muốn nghỉ việc phải báo trước bao nhiêu ngày?",
          "Người lao động phải báo trước ít nhất 30 ngày đối với HĐLĐ xác định thời hạn từ 12 đến 36 tháng.",
          ["3 ngày làm việc", "10 ngày", "30 ngày", "45 ngày"],
          2
        ),
        quiz(
          "Người lao động ký HĐLĐ dưới 12 tháng muốn nghỉ việc thông thường phải báo trước bao nhiêu ngày làm việc?",
          "Người lao động phải báo trước ít nhất 03 ngày làm việc đối với HĐLĐ dưới 12 tháng.",
          ["3 ngày", "5 ngày", "7 ngày", "15 ngày"],
          0
        ),
        quiz(
          "Người lao động bị ngược đãi, đánh đập hoặc cưỡng bức lao động tại nơi làm việc nghỉ việc thế nào?",
          "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động ngay lập tức mà không cần báo trước.",
          ["Báo trước 30 ngày", "Báo trước 3 ngày", "Nghỉ ngay không cần báo trước", "Phải được ban giám đốc ký duyệt"],
          2
        ),
        quiz(
          "Lao động nữ mang thai nghỉ việc do có chỉ định của cơ sở khám chữa bệnh phải báo trước thế nào?",
          "Báo trước theo thời hạn do cơ sở khám bệnh, chữa bệnh có thẩm quyền chỉ định.",
          ["Báo trước 45 ngày", "Báo trước 30 ngày", "Theo thời hạn cơ sở khám chữa bệnh chỉ định", "Không cần báo trước"],
          2
        ),
        quiz(
          "Người lao động đơn phương chấm dứt hợp đồng lao động trái pháp luật sẽ không được nhận khoản tiền nào?",
          "Người lao động nghỉ việc trái luật sẽ không được hưởng trợ cấp thôi việc.",
          ["Trợ cấp mất việc", "Trợ cấp thôi việc", "Lương tháng 13", "BHXH 1 lần"],
          1
        ),
        quiz(
          "Nếu người lao động đơn phương chấm dứt hợp đồng trái luật, họ phải bồi thường cho người sử dụng lao động bao nhiêu tiền?",
          "Phải bồi thường nửa tháng tiền lương theo hợp đồng lao động và một khoản tiền tương ứng với tiền lương trong những ngày không báo trước.",
          ["Nửa tháng tiền lương và tiền lương những ngày không báo trước", "01 tháng tiền lương", "Không phải bồi thường", "Bồi thường toàn bộ chi phí đào tạo cũ"],
          0
        ),
        quiz(
          "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động không cần báo trước trong trường hợp nào sau đây?",
          "Bị ngược đãi, đánh đập hoặc có hành vi nhục mạ, hành vi làm ảnh hưởng đến sức khoẻ, nhân phẩm, danh dự; bị quấy rối tình dục tại nơi làm việc.",
          ["Đủ tuổi nghỉ hưu", "Bị quấy rối tình dục tại nơi làm việc", "Tìm được công việc mới lương cao hơn", "Muốn đi du lịch dài ngày"],
          1
        ),
      ];
    case "nghi-phep-nam":
      return [
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
        quiz(
          "Cứ sau bao nhiêu năm làm việc thì số ngày nghỉ hằng năm của người lao động được tăng thêm 01 ngày?",
          "Cứ 05 năm làm việc cho một người sử dụng lao động thì số ngày nghỉ hằng năm của người lao động được tăng thêm tương ứng 01 ngày.",
          ["3 năm", "5 năm", "7 năm", "10 năm"],
          1
        ),
        quiz(
          "Người lao động làm việc dưới 12 tháng thì số ngày nghỉ hằng năm tính thế nào?",
          "Số ngày nghỉ hằng năm được tính theo tỷ lệ tương ứng với số tháng làm việc thực tế.",
          ["Không được nghỉ", "Tính theo tỷ lệ tương ứng với số tháng làm việc", "Được nghỉ đủ 12 ngày", "Tùy thuộc vào người quản lý trực tiếp"],
          1
        ),
        quiz(
          "Người làm công việc nặng nhọc, độc hại, nguy hiểm được nghỉ hằng năm ít nhất bao nhiêu ngày?",
          "Người làm nghề, công việc nặng nhọc, độc hại, nguy hiểm được nghỉ hằng năm ít nhất 14 ngày làm việc.",
          ["12 ngày", "14 ngày", "16 ngày", "18 ngày"],
          1
        ),
        quiz(
          "Người làm công việc đặc biệt nặng nhọc, độc hại, nguy hiểm được nghỉ hằng năm ít nhất bao nhiêu ngày?",
          "Người làm nghề, công việc đặc biệt nặng nhọc, độc hại, nguy hiểm được nghỉ hằng năm ít nhất 16 ngày làm việc.",
          ["14 ngày", "16 ngày", "18 ngày", "20 ngày"],
          1
        ),
        quiz(
          "Người lao động có thể thỏa thuận với người sử dụng lao động để gộp ngày nghỉ phép năm thế nào?",
          "Người lao động có thể thoả thuận để nghỉ gộp tối đa 03 năm một lần.",
          ["Gộp ngày nghỉ của tối đa 3 năm", "Bán lại ngày nghỉ lấy tiền mặt khi đang đi làm", "Nghỉ trước cho năm sau", "Cho người khác nghỉ thay"],
          0
        ),
        quiz(
          "Khi thôi việc, bị mất việc làm mà chưa nghỉ hằng năm hoặc chưa nghỉ hết số ngày nghỉ hằng năm thì thế nào?",
          "Người lao động được người sử dụng lao động thanh toán tiền lương cho những ngày chưa nghỉ hoặc chưa nghỉ hết.",
          ["Được thanh toán bằng tiền cho những ngày chưa nghỉ", "Bị mất quyền lợi này hoàn toàn", "Chỉ được chuyển sang công ty mới", "Được quy đổi thành thẻ mua sắm"],
          0
        ),
        quiz(
          "Tiền lương làm căn cứ thanh toán cho những ngày chưa nghỉ phép năm khi thôi việc được tính thế nào?",
          "Là tiền lương theo hợp đồng lao động của tháng trước liền kề tháng người lao động thôi việc, bị mất việc làm.",
          ["Là tiền lương bình quân của 06 tháng liền kề trước khi nghỉ việc", "Là tiền lương tháng trước liền kề tháng thôi việc", "Lương thử việc", "Lương thỏa thuận của tháng đầu tiên"],
          1
        ),
        quiz(
          "Người sử dụng lao động có quyền quy định lịch nghỉ hằng năm của người lao động không?",
          "Người sử dụng lao động có quyền quy định lịch nghỉ hằng năm sau khi tham khảo ý kiến của người lao động và phải thông báo trước cho người lao động biết.",
          ["Không có quyền", "Có quyền quy định sau khi tham khảo ý kiến người lao động và phải thông báo trước", "Chỉ quy định khi công ty gặp khó khăn", "Hoàn toàn tùy ý không cần báo trước"],
          1
        ),
      ];
    case "toc-do-trong-khu-dan-cu":
      return [
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
        quiz(
          "Đường hai chiều không có dải phân cách giữa trong khu đông dân cư, tốc độ tối đa cho xe cơ giới là bao nhiêu?",
          "Đường hai chiều không có dải phân cách giữa hoặc đường một chiều có 01 làn xe cơ giới có tốc độ tối đa là 50 km/h.",
          ["40 km/h", "50 km/h", "60 km/h", "70 km/h"],
          1
        ),
        quiz(
          "Xe máy chuyên dùng, xe gắn máy (kể cả xe máy điện) chạy trong khu dân cư tốc độ tối đa cho phép là bao nhiêu?",
          "Đối với xe máy chuyên dùng, xe gắn máy (kể cả xe máy điện) tốc độ tối đa cho phép là không quá 40 km/h.",
          ["Không quá 30 km/h", "Không quá 40 km/h", "Không quá 50 km/h", "Không quá 60 km/h"],
          1
        ),
        quiz(
          "Tác dụng của việc giữ khoảng cách an toàn giữa các xe khi tham gia giao thông là gì?",
          "Giúp lái xe phản ứng kịp thời và tránh va chạm trực tiếp khi xe phía trước phanh gấp.",
          ["Tránh va chạm khi xe phía trước phanh gấp", "Để dễ vượt xe khác", "Tiết kiệm xăng", "Để chụp ảnh đẹp"],
          0
        ),
        quiz(
          "Khoảng cách an toàn tối thiểu giữa hai xe khi chạy với tốc độ 60 km/h trong điều kiện đường khô ráo là bao nhiêu mét?",
          "Khi tốc độ từ trên 60 km/h đến 80 km/h, khoảng cách an toàn tối thiểu quy định là 35 mét (ở tốc độ đúng 60 km/h thường áp dụng mức tối thiểu này để bảo đảm an toàn).",
          ["35m", "55m", "70m", "100m"],
          0
        ),
        quiz(
          "Khi trời mưa, sương mù, đường trơn trượt, người lái xe phải điều chỉnh khoảng cách an toàn thế nào?",
          "Lái xe phải điều chỉnh khoảng cách an toàn thích hợp, lớn hơn khoảng cách an toàn tối thiểu ghi trên biển báo hoặc trị số thông thường.",
          ["Giữ nguyên như đường khô ráo", "Phải lớn hơn khoảng cách an toàn quy định thông thường", "Thu nhỏ khoảng cách lại để nhìn rõ xe trước", "Tắt đèn xe để tránh lóa mắt"],
          1
        ),
        quiz(
          "Biển báo hiệu 'Bắt đầu khu đông dân cư' có mã ký hiệu là gì?",
          "Biển hiệu mã R.420 dùng để báo bắt đầu đường qua khu đông dân cư.",
          ["R.420", "R.421", "P.106", "W.201"],
          0
        ),
        quiz(
          "Biển báo hiệu 'Hết khu đông dân cư' có mã ký hiệu là gì?",
          "Biển hiệu mã R.421 dùng để báo hết khu đông dân cư.",
          ["R.420", "R.421", "DP.135", "P.127"],
          1
        ),
        quiz(
          "Hành vi chạy xe quá tốc độ quy định từ 5 km/h đến dưới 10 km/h đối với xe mô tô, xe gắn máy bị phạt tiền thế nào?",
          "Chạy quá tốc độ quy định từ 5 km/h đến dưới 10 km/h đối với xe máy bị phạt tiền từ 300.000đ đến 400.000đ.",
          ["Không bị phạt", "Bị phạt từ 100.000đ đến 200.000đ", "Bị phạt từ 300.000đ đến 400.000đ", "Bị tịch thu phương tiện"],
          2
        ),
      ];
    case "giay-to-can-mang-khi-lai-xe":
      return [
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
        quiz(
          "Giấy đăng ký xe bản sao có được chấp nhận khi tham gia giao thông không?",
          "Được chấp nhận nếu kèm bản gốc giấy biên nhận thế chấp còn hiệu lực của tổ chức tín dụng giữ bản chính.",
          ["Được chấp nhận nếu kèm bản gốc biên nhận của tổ chức tín dụng giữ bản chính", "Không bao giờ được chấp nhận", "Chỉ được chấp nhận vào ban ngày", "Chỉ cần chụp ảnh trên điện thoại"],
          0
        ),
        quiz(
          "Bảo hiểm bắt buộc trách nhiệm dân sự của chủ xe cơ giới còn hiệu lực có bắt buộc phải mang theo không?",
          "Người lái xe bắt buộc phải mang theo Giấy chứng nhận bảo hiểm bắt buộc trách nhiệm dân sự của chủ xe cơ giới còn hiệu lực (bản giấy hoặc bản điện tử).",
          ["Không cần mang", "Chỉ mang khi đi xa", "Bắt buộc phải mang theo (bản giấy hoặc bản điện tử)", "Tùy vào người kiểm tra"],
          2
        ),
        quiz(
          "Giấy chứng nhận kiểm định an toàn kỹ thuật và bảo vệ môi trường (đối với xe ô tô) có bắt buộc mang theo không?",
          "Khi đi đường bằng xe ô tô, bắt buộc phải mang theo Giấy chứng nhận kiểm định an toàn kỹ thuật và bảo vệ môi trường.",
          ["Bắt buộc mang theo", "Không cần mang nếu xe mới mua", "Chỉ mang bản photo", "Chỉ cần mang sổ đăng kiểm cũ"],
          0
        ),
        quiz(
          "VneID tích hợp GPLX và đăng ký xe có được chấp nhận thay thế giấy tờ vật lý khi CSGT kiểm tra không?",
          "Được chấp nhận khi thông tin giấy tờ đã được tích hợp và xác thực hợp lệ trên ứng dụng định danh điện tử VNeID và hệ thống kiểm tra có thể truy xuất.",
          ["Được chấp nhận khi đã xác thực hợp lệ trên VNeID và hệ thống hỗ trợ quét thông tin", "Không được chấp nhận dưới mọi hình thức", "Chỉ chấp nhận đối với GPLX hạng A1", "Chỉ chấp nhận khi đi xe đạp"],
          0
        ),
        quiz(
          "Lái xe ô tô không mang theo Giấy phép lái xe bị phạt tiền thế nào?",
          "Lái xe ô tô không mang theo Giấy phép lái xe bị phạt tiền từ 200.000đ đến 400.000đ theo Nghị định 100/2019/NĐ-CP.",
          ["Phạt cảnh cáo", "Phạt từ 200.000đ đến 400.000đ", "Phạt 2.000.000đ", "Tịch thu GPLX mãi mãi"],
          1
        ),
        quiz(
          "Không có Giấy phép lái xe (khác với không mang) đối với người điều khiển xe mô tô từ 175 cm3 trở lên bị phạt thế nào?",
          "Hành vi điều khiển xe mô tô từ 175 cm3 trở lên mà không có GPLX bị phạt tiền từ 4.000.000đ đến 5.000.000đ.",
          ["Phạt từ 1.000.000đ đến 2.000.000đ", "Phạt từ 4.000.000đ đến 5.000.000đ", "Phạt từ 10.000.000đ đến 20.000.000đ", "Chỉ bị tịch thu xe"],
          1
        ),
        quiz(
          "Thời hạn tạm giữ phương tiện để ngăn chặn hành vi vi phạm hành chính thông thường là bao lâu?",
          "Thời hạn tạm giữ phương tiện thông thường tối đa không quá 07 ngày kể từ ngày tạm giữ.",
          ["Tối đa 7 ngày", "Tối đa 30 ngày", "Tối đa 60 ngày", "Không giới hạn thời gian"],
          0
        ),
        quiz(
          "Người chưa đủ tuổi điều khiển xe máy (dưới 16 tuổi chạy xe máy trên 50cc) bị xử phạt thế nào?",
          "Chỉ bị phạt cảnh cáo đối với người từ đủ 14 tuổi đến dưới 16 tuổi điều khiển xe mô tô, xe gắn máy.",
          ["Không phạt tiền mà chỉ phạt cảnh cáo", "Phạt tiền 2 triệu đồng", "Phạt tù 1 năm", "Phạt lao động công ích"],
          0
        ),
      ];
    case "nhan-dien-link-phishing":
      return [
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
        quiz(
          "Phishing link thường sử dụng thủ thuật gì đối với tên miền?",
          "Thường thay đổi nhỏ rất khó phát hiện bằng mắt thường như đổi chữ 'o' thành '0', chữ 'i' thành 'l', '1' hoặc thêm tên phụ vào sau.",
          ["Tên miền hoàn giống 100%", "Thay đổi nhỏ khó phát hiện như thay chữ cái tương đồng hoặc thêm ký tự lạ", "Đăng ký tên miền chính thức của chính phủ", "Sử dụng tên miền có chữ 'https' an toàn"],
          1
        ),
        quiz(
          "Giao thức 'https://' ở đầu địa chỉ web chứng minh điều gì?",
          "Nó chỉ chứng minh dữ liệu được truyền tải được mã hoá, kẻ lừa đảo vẫn có thể mua chứng chỉ SSL để làm trang web phishing sử dụng https.",
          ["Trang web này an toàn 100% không phải lừa đảo", "Dữ liệu truyền đi được mã hóa bảo mật nhưng trang web vẫn có thể là giả mạo", "Trang này thuộc về chính phủ", "Trang này không thể bị hack"],
          1
        ),
        quiz(
          "Tác hại lớn nhất khi nhập thông tin vào biểu mẫu phishing là gì?",
          "Kẻ tấn công sẽ lấy được thông tin đăng nhập, OTP và đánh cắp tiền trong tài khoản của bạn.",
          ["Bị lộ tài khoản, mật khẩu, thông tin thẻ dẫn đến mất tiền", "Máy tính chạy nhanh hơn", "Màn hình điện thoại bị đổi màu", "Nhận được nhiều email quảng cáo"],
          0
        ),
        quiz(
          "Khi nhận được email/tin nhắn thông báo tài khoản ngân hàng bị khóa khẩn cấp kèm link xử lý, bạn nên làm gì?",
          "Ngân hàng không bao giờ yêu cầu xử lý tài khoản qua link lạ. Hãy bỏ qua tin nhắn và gọi hotline ngân hàng để xác thực.",
          ["Click ngay và nhập mật khẩu để mở khóa", "Bỏ qua hoặc liên hệ hotline chính thức của ngân hàng để xác minh", "Nhắn tin cho người gửi hỏi mật khẩu của họ", "Gửi tin nhắn cho bạn bè cảnh báo trước khi bấm"],
          1
        ),
        quiz(
          "Các trình duyệt hiện đại cảnh báo trang web không an toàn bằng cách nào?",
          "Hiển thị một màn hình cảnh báo màu đỏ (SmartScreen/Safe Browsing) trước khi cho phép truy cập.",
          ["Hiện màn hình cảnh báo màu đỏ kèm thông tin trang web nguy hiểm", "Tự động tắt máy tính", "Phát ra tiếng chuông cảnh báo", "Gửi SMS về điện thoại"],
          0
        ),
        quiz(
          "Vì sao kẻ xấu thường tạo cảm giác khẩn cấp (ví dụ: giới hạn 5 phút xử lý) trong tin nhắn lừa đảo?",
          "Để kích động sự hoảng loạn khiến người dùng hành động nhanh mà không suy nghĩ hay đối chiếu xác thực.",
          ["Để kích thích sự hoảng sợ và tò mò khiến nạn nhân hành động nhanh không kịp suy nghĩ kiểm chứng", "Để tuân thủ quy định an ninh mạng", "Để tiết kiệm băng thông", "Vì hệ thống tự động thiết lập như vậy"],
          0
        ),
        quiz(
          "Cách kiểm tra tên miền thực sự của một liên kết trên máy tính trước khi nhấp chuột là gì?",
          "Bạn nên rê chuột lên liên kết để xem thanh trạng thái của trình duyệt ở góc dưới hiển thị URL thực sự là gì.",
          ["Bấm vào liên kết xem hiện ra gì", "Rê chuột lên liên kết (hover) để xem địa chỉ đích thực sự hiển thị ở góc trình duyệt", "Gõ tên miền lên Google để tìm kiếm", "Tắt mạng internet rồi bấm thử"],
          1
        ),
        quiz(
          "Nếu đã lỡ nhập thông tin mật khẩu ngân hàng vào link phishing, việc đầu tiên cần làm ngay lập tức là gì?",
          "Ngay lập tức đăng nhập vào app chính thức để đổi mật khẩu và liên hệ hotline ngân hàng để khóa thẻ/tài khoản khẩn cấp.",
          ["Chờ xem có mất tiền không", "Đổi mật khẩu tài khoản ngân hàng ngay lập tức và liên hệ hotline để khóa tài khoản khẩn cấp", "Đợi đến ngày mai đi báo công an", "Tắt nguồn điện thoại"],
          1
        ),
      ];
    case "bao-ve-otp-va-mat-khau":
      return [
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
        quiz(
          "Ý nghĩa của từ viết tắt 'OTP' trong bảo mật là gì?",
          "OTP là mật khẩu sử dụng một lần (One-Time Password) có giá trị trong thời gian rất ngắn.",
          ["One Time Password (Mật khẩu sử dụng một lần)", "Over The Phone (Qua điện thoại)", "Online Transaction Protocol (Giao thức giao dịch trực tuyến)", "Open Token Password"],
          0
        ),
        quiz(
          "OTP thường được gửi qua các kênh nào?",
          "SMS, Email, ứng dụng xác thực chuyên dụng (Google Authenticator) hoặc tính năng Smart OTP của ngân hàng.",
          ["SMS", "Email", "Ứng dụng xác thực (Authenticator) hoặc Smart OTP", "Tất cả các phương án trên"],
          3
        ),
        quiz(
          "Tính năng xác thực 2 yếu tố (2FA) bảo vệ tài khoản của bạn thế nào?",
          "Khiến kẻ xấu không thể truy cập tài khoản ngay cả khi họ biết mật khẩu vì họ không có thiết bị nhận mã xác thực thứ hai.",
          ["Bắt buộc nhập thêm mã xác thực thứ hai ngay cả khi kẻ xấu biết mật khẩu chính xác", "Tự động xóa tài khoản khi có người đăng nhập lạ", "Không cho phép đổi mật khẩu từ xa", "Tự động phát hiện virus trên máy tính"],
          0
        ),
        quiz(
          "Một mật khẩu được coi là mạnh khi đáp ứng tiêu chí nào?",
          "Độ dài tốt, có chữ hoa/thường, số, ký tự đặc biệt và không chứa thông tin cá nhân dễ đoán.",
          ["Dài từ 8 ký tự trở lên, gồm chữ hoa, chữ thường, số và ký tự đặc biệt", "Không chứa thông tin cá nhân dễ đoán như ngày sinh, tên riêng", "Là một chuỗi từ ngẫu nhiên không có nghĩa rõ ràng", "Tất cả các tiêu chí trên"],
          3
        ),
        quiz(
          "Vì sao không nên dùng chung một mật khẩu cho nhiều tài khoản dịch vụ khác nhau?",
          "Vì khi kẻ xấu hack được mật khẩu của một dịch vụ nhỏ, họ sẽ dùng nó để đăng nhập trái phép vào email, ngân hàng, mạng xã hội của bạn.",
          ["Nếu một tài khoản bị rò rỉ kẻ xấu sẽ dùng mật khẩu đó để dò và hack tất cả các tài khoản còn lại của bạn", "Để dễ ghi nhớ hơn", "Để tránh bị hệ thống khóa tài khoản vì trùng lặp", "Để tiết kiệm bộ nhớ"],
          0
        ),
        quiz(
          "Khi nhận được cuộc gọi yêu cầu đọc mã OTP để nhận quà tặng tri ân hoặc giải quyết sự cố kỹ thuật, bạn nên làm gì?",
          "Từ chối tuyệt đối vì nhân viên ngân hàng/dịch vụ không bao giờ yêu cầu khách hàng cung cấp mã OTP dưới bất kỳ lý do gì.",
          ["Đọc ngay mã OTP để tránh mất quà", "Từ chối tuyệt đối vì nhân viên ngân hàng/dịch vụ không bao giờ yêu cầu cung cấp OTP", "Đọc mã sai để trêu đùa kẻ gọi điện", "Chuyển cuộc gọi cho người thân"],
          1
        ),
        quiz(
          "Ứng dụng quản lý mật khẩu (Password Manager) có vai trò gì?",
          "Lưu trữ mã hóa mật khẩu giúp tạo các mật khẩu phức tạp khác nhau cho từng trang web mà không cần tự nhớ.",
          ["Lưu trữ mã hóa mật khẩu giúp tạo các mật khẩu phức tạp khác nhau cho từng trang web mà không cần tự nhớ", "Tự động gửi mật khẩu cho bạn bè", "Chặn virus quảng cáo trên trình duyệt", "Tự động đổi mật khẩu hàng ngày"],
          0
        ),
        quiz(
          "Smart OTP (tích hợp trực tiếp trên ứng dụng ngân hàng) an toàn hơn SMS OTP ở điểm nào?",
          "Mã OTP được sinh ra độc lập trên thiết bị di động đã đăng ký, tránh được nguy cơ bị chặn bắt sóng điện thoại hoặc hack SIM.",
          ["Không bị kẻ xấu chặn thu tín hiệu sóng viễn thông hoặc tráo SIM điện thoại để trộm mã OTP", "Smart OTP tạo mã nhanh hơn", "Không cần kết nối mạng viễn thông khi đi nước ngoài", "Tất cả các phương án trên"],
          3
        ),
      ];
    case "nhan-dien-app-dau-tu-gia-mao":
      return [
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
        quiz(
          "Vì sao các app đầu tư lừa đảo thường cho rút tiền dễ dàng ở một vài lần đầu với số tiền nhỏ?",
          "Để kích thích lòng tham và xây dựng niềm tin của nạn nhân trước khi dụ dỗ nạp tiền với giá trị lớn.",
          ["Để tạo lòng tin dẫn dụ nạn nhân nạp thêm số tiền lớn hơn gấp nhiều lần", "Vì họ hoạt động hợp pháp", "Vì hệ thống bị lỗi kỹ thuật", "Vì họ muốn tặng tiền cho người dùng trải nghiệm"],
          0
        ),
        quiz(
          "Khi số tiền đầu tư tăng lên lớn, các app lừa đảo thường dùng cớ gì để ngăn cản nạn nhân rút tiền?",
          "Họ thường bịa ra các lý do như phí đóng thuế, phí nâng cấp VIP, phí phạt tài khoản bất thường hoặc đóng sập app.",
          ["Yêu cầu nạp thêm tiền thuế, phí giải ngân, tiền phạt do vi phạm quy chế hoặc nâng cấp VIP mới được rút", "Báo lỗi hệ thống đang nâng cấp bảo trì kéo dài vô thời hạn", "Đóng app hoàn toàn và cắt đứt liên lạc", "Tất cả các phương án trên"],
          3
        ),
        quiz(
          "Các sàn giao dịch đầu tư tài chính nhị phân (BO), tiền ảo cam kết lợi nhuận 20% - 30% mỗi tháng thực chất hoạt động theo mô hình nào?",
          "Mô hình Ponzi lấy tiền của người sau trả cho người trước, khi không có người mới tham gia sàn sẽ sập.",
          ["Mô hình Ponzi (lấy tiền của người sau trả cho người trước)", "Sàn chứng khoán quốc tế uy tín được bảo hộ", "Quỹ đầu tư mạo hiểm quốc tế", "Công ty công nghệ tài chính phi lợi nhuận"],
          0
        ),
        quiz(
          "Ở Việt Nam, các tổ chức được phép huy động vốn và kinh doanh dịch vụ ngân hàng phải được cấp phép bởi cơ quan nào?",
          "Ngân hàng Nhà nước Việt Nam là cơ quan cấp phép và quản lý các hoạt động huy động tài chính này.",
          ["Ngân hàng Nhà nước Việt Nam", "Bộ Thông tin và Truyền thông", "Ủy ban Nhân dân tỉnh", "Hiệp hội thương mại điện tử"],
          0
        ),
        quiz(
          "Khi bị dụ dỗ tham gia nhóm Telegram 'lệnh VIP' có các chuyên gia đọc lệnh cam kết bao lỗ 100%, bạn nên làm gì?",
          "Tuyệt đối rời nhóm ngay vì các thành viên khoe lãi trong nhóm thực chất đều là chim mồi (hoặc tài khoản ảo) của kẻ lừa đảo.",
          ["Tham gia ngay để kiếm thêm thu nhập thụ động", "Cảnh giác và rời nhóm ngay vì đây là các tài khoản ảo tự tung hứng phối hợp lừa đảo", "Thử nạp số tiền nhỏ xem chuyên gia đọc lệnh đúng không", "Giới thiệu cho gia đình cùng tham gia"],
          1
        ),
        quiz(
          "Một ứng dụng đầu tư tài chính không có thông tin doanh nghiệp rõ ràng và chỉ cho nạp tiền qua tài khoản cá nhân có độ tin cậy thế nào?",
          "Đây là dấu hiệu lừa đảo đặc trưng, tài khoản nhận tiền thường là tài khoản đi thuê/mua của người khác.",
          ["Không đáng tin cậy, đây là dấu hiệu rõ ràng của lừa đảo ẩn danh", "Rất đáng tin cậy vì bảo mật thông tin doanh nghiệp", "Bình thường vì xu hướng chuyển khoản cá nhân tiện lợi", "Chỉ cần ứng dụng mượt là an tâm"],
          0
        ),
        quiz(
          "Khi muốn đầu tư chứng khoán chính thống tại Việt Nam, người dân nên mở tài khoản ở đâu?",
          "Mở tài khoản tại các công ty chứng khoán chính thức được cấp phép bởi Ủy ban Chứng khoán Nhà nước.",
          ["Các công ty chứng khoán được cấp phép hoạt động bởi Ủy ban Chứng khoán Nhà nước", "Các app tải từ link file .APK do tư vấn viên gửi qua Zalo", "Các sàn giao dịch ngoại hối không rõ nguồn gốc", "Các hội nhóm kín trên mạng xã hội"],
          0
        ),
        quiz(
          "Nếu nhận ra mình đã bị lừa nạp tiền vào app đầu tư giả mạo và không thể rút ra, bạn nên xử lý thế nào?",
          "Ngay lập tức dừng nạp tiền, thu thập bằng chứng chuyển khoản và nộp đơn tố giác lên cơ quan Công an.",
          ["Tiếp tục nạp thêm tiền hy vọng sẽ rút được", "Dừng nạp tiền ngay lập tức, thu thập lịch sử chat, biên lai chuyển khoản và trình báo công an", "Chấp nhận mất mát và không làm gì", "Chia sẻ tài khoản cho người lạ hứa hack app lấy lại tiền giúp"],
          1
        ),
      ];
    case "tranh-bi-lua-coc-mua-hang":
      return [
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
        quiz(
          "Thủ thuật 'tạo sự khan hiếm' của bên bán hàng lừa đảo nhằm mục đích gì?",
          "Tạo áp lực tâm lý khiến người mua hoang mang, sợ bỏ lỡ cơ hội và nhanh chóng chuyển khoản đặt cọc mà không kịp xác minh thông tin.",
          ["Thúc ép người mua chuyển khoản cọc nhanh chóng không kịp suy nghĩ hay kiểm tra thông tin", "Thể hiện uy tín sản phẩm bán chạy", "Tuân thủ quy định kinh doanh", "Để thông báo tình trạng kho hàng"],
          0
        ),
        quiz(
          "Khi mua hàng từ người bán cá nhân trên mạng xã hội, cách giao dịch an toàn nhất là gì?",
          "Nên nhận hàng qua hình thức COD, cho phép kiểm tra ngoại quan hàng hoá trước khi thanh toán tiền mặt cho shipper.",
          ["Chuyển khoản thanh toán trước 100% để được freeship", "Sử dụng hình thức COD (nhận hàng, kiểm tra hàng rồi mới thanh toán tiền cho shipper)", "Đặt cọc trước 50% giá trị đơn hàng", "Cung cấp thông tin thẻ tín dụng cho người bán quẹt giúp"],
          1
        ),
        quiz(
          "Làm thế nào để kiểm tra mức độ uy tín của một trang bán hàng (fanpage) trên Facebook?",
          "Kiểm tra 'Tính minh bạch của Trang' để xem thời gian thành lập, các quốc gia quản lý trang và lịch sử thay đổi tên fanpage.",
          ["Xem ngày thành lập trang và lịch sử đổi tên trang trong mục 'Tính minh bạch của Trang'", "Xem số lượng lượt like và comment ảo mua được", "Nhìn ảnh đại diện bắt mắt", "Hỏi trực tiếp admin trang đó"],
          0
        ),
        quiz(
          "Việc chuyển khoản đặt cọc mua hàng vào số tài khoản cá nhân có rủi ro gì?",
          "Kẻ lừa đảo có thể sử dụng tài khoản rác (tài khoản mua lại) rồi biến mất, xoá tài khoản mạng xã hội để trốn tránh.",
          ["Người bán có thể chặn liên lạc, biến mất ngay sau khi nhận tiền mà không giao hàng", "Tài khoản ngân hàng đó có thể là tài khoản đi thuê/mua của người khác khiến khó truy vết", "Khó đòi lại tiền khi xảy ra tranh chấp sản phẩm", "Tất cả các phương án trên"],
          3
        ),
        quiz(
          "Khi thỏa thuận đặt cọc mua bán sản phẩm giá trị lớn (như xe máy, điện thoại), giấy biên nhận đặt cọc cần có thông tin gì?",
          "CCCD hai bên, số tiền đặt cọc, cam kết nếu bên bán không giao hàng thì bồi thường thế nào.",
          ["Thông tin định danh của hai bên (Họ tên, CCCD, địa chỉ)", "Số tiền cọc, tình trạng sản phẩm thỏa thuận và cam kết bồi thường nếu vi phạm", "Chữ ký xác nhận trực tiếp của cả hai bên", "Tất cả các phương án trên"],
          3
        ),
        quiz(
          "Nếu người bán gửi link yêu cầu bạn đăng nhập tài khoản ngân hàng để nhận tiền cọc ngược lại từ họ, bạn nên làm gì?",
          "Tuyệt đối không nhấp link hay đăng nhập, đây là thủ đoạn phishing chiếm đoạt mã OTP/tài khoản ngân hàng.",
          ["Đăng nhập ngay để nhận tiền", "Tuyệt đối không đăng nhập vì đó là trang giả mạo đánh cắp tài khoản ngân hàng", "Nhờ bạn bè đăng nhập hộ", "Gọi điện cho ngân hàng bảo họ nhận tiền hộ"],
          1
        ),
        quiz(
          "Công cụ nào giúp kiểm tra số điện thoại hoặc số tài khoản ngân hàng có nằm trong danh sách đen lừa đảo hay không?",
          "Tra cứu tại các trang uy tín như tinnhiem.vn hoặc Cổng cảnh báo lừa đảo trực tuyến khonggianmang.vn.",
          ["Trang web tin cậy như tinnhiem.vn hoặc các cổng tra cứu cảnh báo lừa đảo của Cục An toàn thông tin", "Danh bạ điện thoại cá nhân", "Google Map", "Ứng dụng xem phim trực tuyến"],
          0
        ),
        quiz(
          "Quyền lợi tối thiểu của bạn khi mua hàng trực tuyến có đặt cọc là gì?",
          "Người bán phải thực hiện đúng cam kết và giao hàng đúng chất lượng, nếu không bạn có quyền đòi lại cọc hoặc yêu cầu đền bù theo thỏa thuận dân sự.",
          ["Được yêu cầu cung cấp hóa đơn, biên nhận cọc và được hoàn trả tiền cọc đầy đủ nếu bên bán không giao hàng đúng cam kết", "Bị mất cọc nếu không mua nữa dù lỗi thuộc về bên bán", "Không được quyền ý kiến gì", "Phải trả thêm phí lưu kho hàng ngày"],
          0
        ),
      ];
    case "doi-tra-khi-mua-hang-online":
      return [
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
        quiz(
          "Theo Luật Bảo vệ quyền lợi người tiêu dùng, người bán có trách nhiệm gì khi thông tin sản phẩm bị sai lệch?",
          "Người bán có trách nhiệm thu hồi và hoàn trả tiền cho người mua đối với hàng hoá không đúng mô tả.",
          ["Chịu trách nhiệm đổi trả sản phẩm hoặc hoàn tiền đầy đủ cho người tiêu dùng", "Không có trách nhiệm nếu người mua đã bấm nhận hàng", "Bắt người mua phải tự chịu phí vận chuyển đổi trả", "Chỉ cần xin lỗi là đủ"],
          0
        ),
        quiz(
          "Khi nhận gói hàng từ shipper, việc làm nào giúp bảo vệ quyền lợi đổi trả tốt nhất?",
          "Hãy quay video khui hàng không cắt ghép để làm bằng chứng xác thực tình trạng sản phẩm bên trong.",
          ["Bóc gói hàng thật nhanh và vứt hộp đi", "Quay video quá trình mở hộp (unboxing) rõ mã đơn hàng và tình trạng niêm phong của gói hàng", "Thanh toán tiền rồi đưa gói hàng cho người khác mở hộ", "Không cần kiểm tra cứ cất vào tủ"],
          1
        ),
        quiz(
          "Thời gian yêu cầu đổi trả hàng thông thường trên các sàn thương mại điện tử lớn (Shopee, Lazada, Tiki) là bao lâu sau khi nhận hàng?",
          "Tuỳ thuộc vào loại sản phẩm và quy định của sàn (ví dụ Shopee Mall cho phép đổi trả trong 7 ngày).",
          ["Trong vòng 3 đến 7 ngày tùy thuộc vào loại gian hàng (gian hàng thường hay Mall)", "Chỉ trong vòng 1 giờ đầu tiên", "Vô thời hạn", "Phải đợi sau 1 tháng"],
          0
        ),
        quiz(
          "Trong trường hợp xảy ra tranh chấp đổi trả trên sàn TMĐT, bên nào sẽ đưa ra quyết định xử lý cuối cùng?",
          "Sàn TMĐT đóng vai trò là trọng tài trung gian phán quyết dựa trên bằng chứng cung cấp.",
          ["Người bán", "Người mua", "Ban quản lý sàn thương mại điện tử dựa trên bằng chứng của hai bên cung cấp", "Đơn vị vận chuyển giao hàng"],
          2
        ),
        quiz(
          "Nếu mua hàng ngoài sàn (qua Facebook/Zalo) và bị giao hàng giả, hàng lỗi nhưng người bán chặn liên lạc, bạn có thể làm gì?",
          "Có thể nộp đơn phản ánh lên Cục Cạnh tranh và Bảo vệ người tiêu dùng hoặc gửi đơn khiếu nại lên Hội Bảo vệ người tiêu dùng Việt Nam.",
          ["Tự chịu mất tiền vì mua ngoài không có bảo vệ", "Gửi thông tin tố cáo kèm bằng chứng giao dịch lên các cơ quan chức năng hoặc Hội Bảo vệ người tiêu dùng", "Nhắn tin đe dọa người bán từ nick khác", "Đăng bài nói xấu bừa bãi không chứng cứ"],
          1
        ),
        quiz(
          "Chính sách 'cho phép đồng kiểm' khi nhận hàng có ý nghĩa gì?",
          "Giúp người mua tránh nhận phải hộp rác, hàng gạch đá hoặc sản phẩm vỡ nát trước khi thanh toán.",
          ["Người mua được quyền mở hộp kiểm tra ngoại quan sản phẩm trước khi thanh toán tiền cho shipper", "Người mua phải cùng shipper sử dụng thử sản phẩm 1 ngày", "Shipper được quyền dùng chung sản phẩm", "Người mua không được trả hàng nếu không thích"],
          0
        ),
        quiz(
          "Khi đổi trả hàng lỗi do nhà sản xuất, chi phí vận chuyển đổi trả thông thường do ai chi trả theo quy định bảo vệ người tiêu dùng?",
          "Người bán có trách nhiệm chi trả toàn bộ chi phí vận chuyển thu hồi sản phẩm lỗi.",
          ["Người mua phải chịu hoàn toàn", "Người bán hoặc sàn thương mại điện tử có chính sách hỗ trợ miễn phí vận chuyển thu hồi hàng lỗi", "Shipper phải tự chịu", "Chia đôi mỗi bên một nửa"],
          1
        ),
        quiz(
          "Một cửa hàng ghi biển 'Hàng mua rồi miễn đổi trả' đối với sản phẩm bị lỗi ẩn tì bên trong có đúng luật không?",
          "Không đúng luật, cửa hàng không được đơn phương loại bỏ trách nhiệm bảo hành, đổi trả đối với khuyết tật sản phẩm.",
          ["Đúng luật vì là quy định riêng của shop", "Không đúng luật vì người tiêu dùng có quyền yêu cầu đổi trả hoặc sửa chữa đối với sản phẩm bị lỗi kỹ thuật không do lỗi của người mua", "Chỉ đúng luật vào ngày khuyến mãi", "Tùy thuộc vào thái độ của khách hàng"],
          1
        ),
      ];
    case "yeu-cau-bao-hanh-dung-cach":
      return [
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
        quiz(
          "Tác dụng của Phiếu bảo hành hoặc Kích hoạt bảo hành điện tử là gì?",
          "Chứng minh nguồn gốc sản phẩm chính hãng và xác định khoảng thời hạn bảo hành còn hiệu lực.",
          ["Xác định thời hạn bảo hành và tính hợp lệ của sản phẩm được bảo hành chính hãng", "Tăng dung lượng pin sản phẩm", "Làm đẹp sản phẩm", "Dùng để tích điểm đổi quà"],
          0
        ),
        quiz(
          "Trong thời gian bảo hành sản phẩm, nếu lỗi xảy ra nhiều lần mà không sửa chữa được, người tiêu dùng có quyền yêu cầu gì?",
          "Doanh nghiệp phải đổi sản phẩm tương đương hoặc hoàn tiền cho khách hàng.",
          ["Yêu cầu đổi sản phẩm mới cùng loại hoặc trả lại tiền hoàn lại tiền", "Phải chấp nhận mang đi sửa tiếp không giới hạn số lần", "Tự thanh toán chi phí đổi sản phẩm khác", "Không được quyền đòi hỏi gì thêm"],
          0
        ),
        quiz(
          "Thời gian thực hiện bảo hành sản phẩm được tính thế nào đối với thời hạn bảo hành gốc?",
          "Thời gian thực hiện bảo hành không tính vào thời hạn bảo hành của sản phẩm, tức thời hạn bảo hành sẽ được cộng thêm số ngày sửa chữa sản phẩm.",
          ["Không tính vào thời hạn bảo hành của sản phẩm (thời gian sửa chữa sẽ được cộng nối tiếp)", "Vẫn tính chạy bình thường làm thiệt thòi cho khách hàng", "Do trung tâm bảo hành quyết định", "Bị trừ đôi thời gian"],
          0
        ),
        quiz(
          "Bên bán hoặc nhà sản xuất có được quyền từ chối bảo hành đối với lỗi do người sử dụng gây ra không?",
          "Được quyền từ chối bảo hành nếu sản phẩm bị hư hại do người tiêu dùng tự gây ra (rơi vỡ, vô nước, tự ý tháo mở).",
          ["Có quyền từ chối bảo hành theo quy định chung", "Không được từ chối dưới mọi hình thức", "Chỉ từ chối đối với hàng rẻ tiền", "Chỉ bảo hành vào ngày lẻ trong tuần"],
          0
        ),
        quiz(
          "Người bán có trách nhiệm cung cấp cho người tiêu dùng giấy tờ gì khi nhận sản phẩm đi bảo hành?",
          "Bên tiếp nhận bảo hành phải lập biên nhận ghi nhận rõ ràng tình trạng thực tế của máy và thời hạn hẹn trả máy.",
          ["Giấy biên nhận bảo hành ghi rõ tình trạng máy, lỗi tiếp nhận và hẹn ngày trả kết quả", "Không cần đưa giấy tờ gì chỉ cần thỏa thuận miệng", "Đưa hóa đơn mua hàng mới", "Đăng nhập tài khoản cá nhân của họ"],
          0
        ),
        quiz(
          "Khi mang sản phẩm đi bảo hành tại trung tâm ủy quyền, bạn có cần mang theo phụ kiện kèm theo (sạc, cáp...) không?",
          "Chỉ mang phụ kiện nếu nghi ngờ lỗi phát sinh từ phụ kiện đó, tránh thất lạc phụ kiện tại trung tâm bảo hành.",
          ["Chỉ mang theo nếu phụ kiện đó liên quan trực tiếp đến lỗi cần kiểm tra", "Bắt buộc mang đầy đủ cả hộp đựng gốc", "Không bao giờ được mang phụ kiện đi theo", "Mang đi để tặng cho nhân viên kỹ thuật"],
          0
        ),
        quiz(
          "Chi phí linh kiện và tiền công sửa chữa trong phạm vi bảo hành hợp lệ do ai chi trả?",
          "Bên thực hiện bảo hành (hãng/shop) phải chi trả 100% chi phí sửa chữa bảo hành cho khách hàng.",
          ["Người mua phải trả 50%", "Nhà sản xuất/Nhà phân phối chịu trách nhiệm chi trả toàn bộ theo cam kết bảo hành chính hãng", "Khách hàng phải tự mua linh kiện mang đến", "Shipper vận chuyển chi trả"],
          1
        ),
        quiz(
          "Hội Bảo vệ quyền lợi người tiêu dùng Việt Nam có vai trò gì khi xảy ra tranh chấp bảo hành kéo dài?",
          "Hỗ trợ tư vấn pháp lý và làm cầu nối hoà giải thương lượng giữa doanh nghiệp và người mua.",
          ["Tư vấn pháp lý, hỗ trợ hòa giải giữa người tiêu dùng và doanh nghiệp để bảo vệ quyền lợi hợp pháp", "Bắt giữ chủ doanh nghiệp", "Tịch thu giấy phép kinh doanh của shop ngay lập tức", "Đền bù tiền trực tiếp cho khách hàng"],
          0
        ),
      ];

    case "bao-hiem-xa-hoi-bat-buoc":
      return [
        quiz("Đối tượng nào sau đây bắt buộc phải tham gia BHXH bắt buộc?", "Người lao động làm việc theo HĐLĐ từ đủ 1 tháng trở lên thuộc đối tượng đóng BHXH bắt buộc.", ["HĐLĐ từ đủ 1 tháng trở lên", "HĐLĐ dưới 1 tháng", "Người học việc", "Người thử việc dưới 1 tháng"], 0),
        quiz("Người lao động đóng BHXH bắt buộc vào quỹ hưu trí và tử tuất với tỷ lệ bao nhiêu?", "Người lao động đóng 8% mức tiền lương tháng vào quỹ hưu trí và tử tuất.", ["8%", "10.5%", "14%", "21.5%"], 0),
        quiz("Người sử dụng lao động đóng BHXH bắt buộc vào quỹ hưu trí và tử tuất với tỷ lệ bao nhiêu?", "Người sử dụng lao động đóng 14% vào quỹ hưu trí và tử tuất cho người lao động.", ["8%", "14%", "17.5%", "22%"], 1),
        quiz("Điều kiện hưởng chế độ ốm đau thông thường là gì?", "Người lao động bị ốm đau, tai nạn mà không phải tai nạn lao động phải nghỉ việc và có xác nhận của cơ sở y tế.", ["Bị ốm đau có xác nhận của cơ sở y tế", "Tự xin nghỉ không lý do", "Bị tai nạn lao động", "Nghỉ chăm vợ sinh"], 0),
        quiz("Mức hưởng chế độ ốm đau thông thường bằng bao nhiêu phần trăm tiền lương đóng BHXH?", "Mức hưởng bằng 75% mức tiền lương đóng BHXH của tháng liền kề trước khi nghỉ việc.", ["50%", "75%", "85%", "100%"], 1),
        quiz("Thời gian hưởng chế độ thai sản khi sinh con của lao động nữ là bao lâu?", "Lao động nữ sinh con được nghỉ thai sản trước và sau khi sinh con là 6 tháng.", ["4 tháng", "5 tháng", "6 tháng", "7 tháng"], 2),
        quiz("Để được hưởng lương hưu khi đủ tuổi, người lao động phải đóng BHXH tối thiểu bao nhiêu năm?", "Điều kiện tối thiểu về thời gian đóng BHXH là đủ 20 năm.", ["15 năm", "20 năm", "25 năm", "30 năm"], 1),
        quiz("Trợ cấp mai táng bằng bao nhiêu lần mức lương cơ sở?", "Trợ cấp mai táng bằng 10 lần mức lương cơ sở tại tháng người lao động chết.", ["5 lần", "10 lần", "15 lần", "20 lần"], 1),
        quiz("Người lao động nghỉ việc sau bao lâu không tiếp tục đóng BHXH thì được nhận BHXH 1 lần?", "Người lao động sau 1 năm nghỉ việc mà không tiếp tục đóng BHXH và chưa đủ 20 năm đóng BHXH.", ["6 tháng", "1 năm", "2 năm", "3 năm"], 1),
        quiz("Quỹ bảo hiểm xã hội bắt buộc không bao gồm quỹ thành phần nào sau đây?", "Quỹ BHXH bắt buộc gồm: Ốm đau thai sản; Tai nạn lao động bệnh nghề nghiệp; Hưu trí và tử tuất.", ["Quỹ hưu trí và tử tuất", "Quỹ ốm đau, thai sản", "Quỹ tai nạn lao động, bệnh nghề nghiệp", "Quỹ bảo hiểm thân thể tự nguyện"], 3),
      ];

    case "ky-luat-lao-dong-sa-thai":
      return [
        quiz("Bộ luật Lao động quy định bao nhiêu hình thức kỷ luật lao động?", "Có 4 hình thức kỷ luật lao động: khiển trách; kéo dài thời hạn nâng lương không quá 6 tháng; cách chức; sa thải.", ["3 hình thức", "4 hình thức", "5 hình thức", "Không giới hạn"], 1),
        quiz("Hành vi nào bị nghiêm cấm khi xử lý kỷ luật lao động?", "Nghiêm cấm xúc phạm danh dự, nhân phẩm, thân thể; phạt tiền, cắt lương thay việc xử lý kỷ luật.", ["Phạt tiền hoặc cắt lương", "Khiển trách bằng văn bản", "Đình chỉ công việc tạm thời", "Yêu cầu viết bản kiểm điểm"], 0),
        quiz("Thời hiệu xử lý kỷ luật lao động đối với hành vi vi phạm thông thường là bao lâu?", "Thời hiệu xử lý kỷ luật lao động là 06 tháng kể từ ngày xảy ra hành vi vi phạm.", ["3 tháng", "6 tháng", "12 tháng", "24 tháng"], 1),
        quiz("Cuộc họp xử lý kỷ luật lao động bắt buộc phải có sự tham gia của ai?", "Phải có sự tham gia của tổ chức đại diện người lao động tại cơ sở (công đoàn) và bản thân người lao động.", ["Chỉ cần giám đốc", "Tổ chức đại diện người lao động tại cơ sở và người lao động", "Chỉ cần tổ chức nhân sự", "Khách hàng của công ty"], 1),
        quiz("Hành vi nào sau đây có thể bị áp dụng hình thức kỷ luật sa thải?", "Trộm cắp, tham ô, tiết lộ bí mật kinh doanh, tự ý bỏ việc 5 ngày cộng dồn trong 30 ngày.", ["Đi muộn 2 lần", "Không hoàn thành KPI tháng", "Trộm cắp, tham ô hoặc tiết lộ bí mật kinh doanh", "Cãi nhau với đồng nghiệp"], 2),
        quiz("Không được xử lý kỷ luật lao động đối với người lao động đang trong khoảng thời gian nào?", "Không được kỷ luật khi đang nghỉ ốm đau, điều dưỡng, đang mang thai hoặc nuôi con dưới 12 tháng tuổi.", ["Đang nghỉ ốm đau hoặc nuôi con dưới 12 tháng tuổi", "Đang đi du lịch cá nhân", "Đang trong giờ làm việc", "Đang thử việc"], 0),
        quiz("Người lao động tự ý bỏ việc bao nhiêu ngày cộng dồn trong 30 ngày không có lý do chính đáng thì bị sa thải?", "Tự ý bỏ việc 05 ngày làm việc cộng dồn trong thời hạn 30 ngày không có lý do chính đáng.", ["3 ngày", "5 ngày", "10 ngày", "15 ngày"], 1),
        quiz("Nguyên tắc chứng minh lỗi trong kỷ luật lao động là gì?", "Người sử dụng lao động phải chứng minh được lỗi của người lao động.", ["Người lao động tự chứng minh mình vô tội", "Người sử dụng lao động chứng minh lỗi của người lao động", "Trọng tài lao động quyết định", "Đồng nghiệp làm chứng"], 1),
        quiz("Quyết định kỷ luật lao động bằng văn bản phải được gửi cho ai?", "Phải gửi đến các bên tham dự cuộc họp xử lý kỷ luật.", ["Các bên tham dự cuộc họp", "Chỉ gửi cho người lao động", "Báo cáo Sở Lao động", "Gửi cho gia đình người lao động"], 0),
        quiz("Khi sa thải người lao động trái pháp luật, người sử dụng lao động phải làm gì?", "Phải nhận người lao động trở lại làm việc và bồi thường tiền lương, BHXH trong những ngày không được làm việc.", ["Nhận lại làm việc và bồi thường lương, BHXH", "Chỉ cần xin lỗi", "Trả thêm 1 tháng lương hỗ trợ", "Không phải làm gì nếu đã trả đủ lương cũ"], 0),
      ];

    case "lam-them-gio-va-luong":
      return [
        quiz("Tổng số giờ làm thêm của người lao động không quá bao nhiêu phần trăm số giờ làm việc bình thường trong 01 ngày?", "Tổng số giờ làm thêm không quá 50% số giờ làm việc bình thường trong ngày.", ["30%", "50%", "70%", "100%"], 1),
        quiz("Số giờ làm thêm của người lao động không quá bao nhiêu giờ trong 01 tháng?", "Tổng số giờ làm thêm không quá 40 giờ trong 01 tháng.", ["30 giờ", "40 giờ", "50 giờ", "60 giờ"], 1),
        quiz("Lương làm thêm giờ vào ngày thường được tính ít nhất bằng bao nhiêu phần trăm lương giờ thực trả?", "Làm thêm giờ vào ngày thường ít nhất bằng 150% tiền lương giờ thực trả của công việc đang làm.", ["100%", "150%", "200%", "300%"], 1),
        quiz("Lương làm thêm giờ vào ngày nghỉ hằng tuần được tính ít nhất bằng bao nhiêu phần trăm?", "Làm thêm giờ vào ngày nghỉ hằng tuần ít nhất bằng 200% tiền lương giờ thực trả.", ["150%", "200%", "250%", "300%"], 1),
        quiz("Lương làm thêm giờ vào ngày nghỉ lễ, tết ít nhất bằng bao nhiêu phần trăm lương giờ thực trả?", "Làm thêm giờ vào ngày nghỉ lễ, tết ít nhất bằng 300% (chưa kể tiền lương ngày lễ, tết được hưởng nguyên lương).", ["150%", "200%", "300%", "400%"], 2),
        quiz("Người lao động làm việc vào ban đêm được trả thêm ít nhất bao nhiêu phần trăm?", "Được trả thêm ít nhất bằng 30% tiền lương tính theo đơn giá tiền lương hoặc tiền lương thực trả của ngày làm việc bình thường.", ["20%", "30%", "50%", "100%"], 1),
        quiz("Làm thêm giờ vào ban đêm của ngày thường được trả ít nhất bằng bao nhiêu phần trăm?", "Bằng lương làm thêm ngày thường (150%) + lương ban đêm (30%) + 20% lương ban ngày của ngày thường = 200% lương ngày bình thường.", ["150%", "180%", "200%", "210%"], 2),
        quiz("Số giờ làm thêm trong 01 năm của người lao động thông thường không quá bao nhiêu giờ?", "Tổng số giờ làm thêm không quá 200 giờ trong 01 năm (một số ngành đặc thù được tối đa 300 giờ).", ["200 giờ", "300 giờ", "400 giờ", "500 giờ"], 0),
        quiz("Doanh nghiệp muốn người lao động làm thêm giờ phải đáp ứng điều kiện gì?", "Bắt buộc phải được sự đồng ý của người lao động về thời gian, địa điểm và nội dung làm thêm.", ["Chỉ cần thông báo trước 1 ngày", "Phải được sự đồng ý của người lao động", "Chỉ cần ghi trong nội quy công ty", "Tự quyết định khi cần tiến độ"], 1),
        quiz("Lao động nữ mang thai từ tháng thứ mấy không được làm thêm giờ?", "Mang thai từ tháng thứ 07 (hoặc tháng thứ 06 nếu làm việc ở vùng cao, vùng sâu) hoặc đang nuôi con dưới 12 tháng tuổi.", ["Tháng thứ 3", "Tháng thứ 5", "Tháng thứ 7", "Tháng thứ 9"], 2),
      ];

    case "lao-dong-nu-thai-san":
      return [
        quiz("Lao động nữ được nghỉ khám thai bao nhiêu lần trong suốt thai kỳ?", "Được nghỉ khám thai 05 lần, mỗi lần 01 ngày (trường hợp bệnh lý hoặc xa được 02 ngày).", ["3 lần", "5 lần", "7 lần", "10 lần"], 1),
        quiz("Thời gian nghỉ chế độ thai sản khi sinh con của lao động nữ là bao lâu?", "Thời gian nghỉ thai sản trước và sau khi sinh con là 06 tháng.", ["4 tháng", "5 tháng", "6 tháng", "8 tháng"], 2),
        quiz("Khi sinh đôi trở lên, thời gian nghỉ thai sản tính thêm thế nào?", "Từ con thứ hai trở đi, cứ mỗi con được nghỉ thêm 01 tháng.", ["Mỗi con nghỉ thêm 15 ngày", "Từ con thứ hai trở đi, cứ mỗi con nghỉ thêm 01 tháng", "Không được nghỉ thêm", "Gộp chung tối đa 8 tháng"], 1),
        quiz("Lao động nữ nuôi con dưới 12 tháng tuổi được nghỉ bao lâu mỗi ngày trong thời gian làm việc để cho con bú, vắt sữa?", "Được nghỉ 60 phút mỗi ngày trong thời gian làm việc và hưởng đủ lương.", ["30 phút", "45 phút", "60 phút", "90 phút"], 2),
        quiz("Lao động nữ mang thai từ tháng thứ 7 làm công việc nặng nhọc được hưởng quyền lợi gì?", "Được chuyển sang làm công việc nhẹ hơn hoặc giảm bớt 01 giờ làm việc hằng ngày mà không bị cắt giảm lương.", ["Được nghỉ làm hưởng 100% lương", "Được giảm bớt 01 giờ làm việc hằng ngày hoặc chuyển công việc nhẹ hơn", "Phải tự xin nghỉ không lương", "Bắt buộc làm thêm giờ bù lại"], 1),
        quiz("Người sử dụng lao động có được đơn phương chấm dứt HĐLĐ vì lý do người lao động kết hôn, mang thai, nghỉ thai sản?", "Người sử dụng lao động không được sa thải hoặc đơn phương chấm dứt HĐLĐ vì lý do kết hôn, mang thai, nghỉ thai sản.", ["Được phép nếu báo trước 45 ngày", "Không được đơn phương chấm dứt hợp đồng lao động", "Chỉ được phép đối với hợp đồng dưới 1 năm", "Được phép khi có người thay thế"], 1),
        quiz("Mức trợ cấp một lần khi sinh con của lao động nữ bằng bao nhiêu lần mức lương cơ sở?", "Trợ cấp một lần cho mỗi con bằng 2 lần mức lương cơ sở tại tháng lao động nữ sinh con.", ["1 lần", "2 lần", "3 lần", "5 lần"], 1),
        quiz("Lao động nam đang đóng BHXH khi vợ sinh con (sinh thường, 1 con) được nghỉ thai sản bao nhiêu ngày?", "Lao động nam được nghỉ 05 ngày làm việc khi vợ sinh thường 01 con.", ["3 ngày", "5 ngày", "7 ngày", "10 ngày"], 1),
        quiz("Điều kiện để lao động nữ đi làm lại trước khi hết thời gian nghỉ thai sản 6 tháng là gì?", "Đã nghỉ ít nhất được 04 tháng, có xác nhận của cơ sở y tế và được người sử dụng lao động đồng ý.", ["Đã nghỉ ít nhất 4 tháng và có xác nhận đủ sức khỏe", "Đã nghỉ ít nhất 2 tháng", "Chỉ cần người sử dụng lao động yêu cầu", "Không được phép đi làm lại trước hạn"], 0),
        quiz("Sau khi hết thời gian nghỉ thai sản, người lao động có được bảo đảm việc làm cũ không?", "Được bảo đảm việc làm cũ hoặc việc làm tương đương với mức lương không thấp hơn trước khi nghỉ.", ["Được bảo đảm việc làm cũ hoặc tương đương", "Phải nộp đơn xin việc lại từ đầu", "Chỉ được nhận lại làm việc bán thời gian", "Phải chấp nhận giảm 50% lương"], 0),
      ];

    case "tranh-chap-lao-dong":
      return [
        quiz("Tranh chấp lao động cá nhân là tranh chấp giữa các bên nào?", "Tranh chấp giữa người lao động với người sử dụng lao động.", ["Giữa người lao động với người sử dụng lao động", "Giữa hai đồng nghiệp với nhau", "Giữa doanh nghiệp với khách hàng", "Giữa các công đoàn với nhau"], 0),
        quiz("Cơ quan, cá nhân nào có thẩm quyền giải quyết tranh chấp lao động cá nhân đầu tiên?", "Hòa giải viên lao động giải quyết tranh chấp lao động trước khi đưa ra trọng tài hoặc Tòa án.", ["Hòa giải viên lao động", "Ủy ban nhân dân cấp xã", "Cảnh sát khu vực", "Sở Tư pháp"], 0),
        quiz("Thời hiệu yêu cầu Hòa giải viên lao động thực hiện hòa giải tranh chấp lao động cá nhân là bao lâu?", "Thời hiệu yêu cầu hòa giải là 06 tháng kể từ ngày phát hiện hành vi vi phạm quyền lợi.", ["3 tháng", "6 tháng", "1 năm", "2 năm"], 1),
        quiz("Thời hiệu yêu cầu Tòa án nhân dân giải quyết tranh chấp lao động cá nhân trực tiếp là bao lâu?", "Thời hiệu khởi kiện ra Tòa án giải quyết tranh chấp lao động cá nhân là 01 năm kể từ ngày phát hiện hành vi vi phạm.", ["6 tháng", "1 năm", "2 năm", "3 năm"], 1),
        quiz("Hòa giải viên lao động phải kết thúc việc hòa giải trong thời hạn bao nhiêu ngày kể từ ngày nhận được yêu cầu?", "Thời hạn hòa giải là không quá 05 ngày làm việc kể từ ngày nhận được yêu cầu hòa giải.", ["3 ngày", "5 ngày", "7 ngày", "10 ngày"], 1),
        quiz("Tranh chấp lao động cá nhân nào sau đây KHÔNG bắt buộc phải qua thủ tục hòa giải trước khi khởi kiện ra Tòa án?", "Tranh chấp về kỷ luật lao động theo hình thức sa thải hoặc đơn phương chấm dứt HĐLĐ.", ["Tranh chấp về kỷ luật sa thải hoặc đơn phương chấm dứt HĐLĐ", "Tranh chấp về ngày nghỉ phép năm", "Tranh chấp về tiền lương tháng 13", "Tranh chấp về trang phục làm việc"], 0),
        quiz("Hội đồng trọng tài lao động cấp tỉnh do cơ quan nào thành lập?", "Ủy ban nhân dân cấp tỉnh quyết định thành lập Hội đồng trọng tài lao động.", ["Ủy ban nhân dân cấp tỉnh", "Sở Lao động - Thương binh và Xã hội", "Liên đoàn lao động tỉnh", "Tòa án nhân dân tỉnh"], 0),
        quiz("Quyết định của Ban trọng tài lao động có hiệu lực thế nào nếu các bên không khởi kiện ra Tòa án?", "Có hiệu lực thi hành đối với các bên tranh chấp.", ["Bắt buộc thi hành nếu không khởi kiện ra Tòa án", "Chỉ mang tính chất tham khảo", "Có hiệu lực sau 1 năm", "Không có giá trị pháp lý"], 0),
        quiz("Đình công là gì và do tổ chức nào lãnh đạo?", "Đình công là sự ngừng việc tạm thời, tự nguyện và có tổ chức của tập thể lao động do tổ chức đại diện người lao động lãnh đạo.", ["Sự ngừng việc tự nguyện do tổ chức đại diện người lao động lãnh đạo", "Sự bỏ việc tập thể không lý do", "Hành vi phá hoại tài sản công ty", "Việc biểu tình trước cổng doanh nghiệp"], 0),
        quiz("Trường hợp nào sau đây bị coi là cuộc đình công bất hợp pháp?", "Không do tổ chức đại diện người lao động lãnh đạo; đình công tại doanh nghiệp công ích; vi phạm thủ tục báo trước.", ["Không do tổ chức đại diện người lao động tổ chức và lãnh đạo", "Đình công tại nơi có nguy cơ xâm phạm an ninh quốc phòng, trật tự công cộng", "Vi phạm thời hạn báo trước theo luật định", "Tất cả các phương án trên"], 3),
      ];

    case "nong-do-con-khi-lai-xe":
      return [
        quiz("Hành vi điều khiển phương tiện giao thông đường bộ mà trong máu hoặc hơi thở có nồng độ cồn bị cấm thế nào?", "Nghiêm cấm hoàn toàn hành vi điều khiển phương tiện tham gia giao thông đường bộ khi trong máu hoặc hơi thở có nồng độ cồn.", ["Bị cấm hoàn toàn đối với mọi phương tiện", "Chỉ cấm đối với ô tô", "Cho phép đối với xe máy dưới 50cc", "Chỉ cấm khi nồng độ cồn vượt quá 0.25 mg/l khí thở"], 0),
        quiz("Mức phạt tiền cao nhất đối với người điều khiển xe máy vi phạm nồng độ cồn vượt quá 80 mg/100 ml máu hoặc vượt quá 0.4 mg/l khí thở là bao nhiêu?", "Phạt tiền từ 6.000.000đ đến 8.000.000đ đối với người đi xe máy vi phạm nồng độ cồn ở mức cao nhất.", ["2 - 3 triệu đồng", "4 - 5 triệu đồng", "6 - 8 triệu đồng", "30 - 40 triệu đồng"], 2),
        quiz("Mức phạt tiền cao nhất đối với người điều khiển ô tô vi phạm nồng độ cồn ở mức vượt quá 0.4 mg/l khí thở là bao nhiêu?", "Phạt tiền từ 30.000.000đ đến 40.000.000đ đối với ô tô vi phạm nồng độ cồn ở mức kịch khung.", ["10 - 20 triệu đồng", "20 - 30 triệu đồng", "30 - 40 triệu đồng", "60 - 80 triệu đồng"], 2),
        quiz("Người đi xe máy vi phạm nồng độ cồn ở mức cao nhất bị tước Giấy phép lái xe bao lâu?", "Người vi phạm bị tước GPLX từ 22 đến 24 tháng.", ["10 - 12 tháng", "16 - 18 tháng", "22 - 24 tháng", "Tước vĩnh viễn"], 2),
        quiz("Người đi xe đạp, xe thô sơ có bị xử phạt nồng độ cồn hay không?", "Có, người đi xe đạp, xe đạp điện vi phạm nồng độ cồn cũng bị xử phạt hành chính theo Nghị định 100.", ["Không bị phạt", "Chỉ bị nhắc nhở", "Có bị phạt tiền hành chính", "Chỉ phạt khi gây tai nạn"], 2),
        quiz("Lực lượng chức năng có quyền tạm giữ phương tiện vi phạm nồng độ cồn tối đa bao nhiêu ngày?", "Để ngăn chặn hành vi nguy hiểm ngay lập tức, phương tiện có thể bị tạm giữ tối đa đến 07 ngày làm việc.", ["3 ngày", "7 ngày", "15 ngày", "30 ngày"], 1),
        quiz("Hành vi không chấp hành yêu cầu kiểm tra nồng độ cồn của người thi hành công vụ bị xử phạt thế nào?", "Bị áp dụng mức phạt tiền và tước quyền sử dụng GPLX kịch khung tương đương mức vi phạm nồng độ cồn cao nhất.", ["Phạt cảnh cáo", "Bị phạt mức kịch khung như mức vi phạm cao nhất", "Chỉ bị phạt tiền 500.000đ", "Không bị phạt nếu có lý do vội"], 1),
        quiz("Khi uống rượu bia, sau bao lâu thì nồng độ cồn trong cơ thể biến mất hoàn toàn?", "Tùy thuộc vào cơ địa, lượng rượu bia tiêu thụ và sức khỏe của mỗi người, không có mốc thời gian cố định cho tất cả.", ["Cố định sau 4 tiếng", "Cố định sau 12 tiếng", "Cố định sau 24 tiếng", "Tùy thuộc cơ địa, lượng cồn tiêu thụ và sức khỏe từng người"], 3),
        quiz("Người điều khiển xe máy vi phạm nồng độ cồn ở mức chưa vượt quá 50 mg/100 ml máu hoặc chưa vượt quá 0.25 mg/l khí thở bị phạt bao nhiêu tiền?", "Phạt tiền từ 2.000.000đ đến 3.000.000đ đối với người đi xe máy vi phạm nồng độ cồn mức thấp nhất.", ["500.000đ - 1.000.000đ", "2.000.000đ - 3.000.000đ", "4.000.000đ - 5.000.000đ", "Chỉ bị nhắc nhở"], 1),
        quiz("Chủ phương tiện giao xe cho người đã uống rượu bia điều khiển tham gia giao thông có bị phạt không?", "Chủ phương tiện (cá nhân, tổ chức) sẽ bị xử phạt tiền về hành vi giao xe cho người không đủ điều kiện điều khiển.", ["Không bị phạt", "Chỉ bị nhắc nhở", "Có, bị phạt tiền hành chính đối với chủ xe", "Chỉ phạt người lái xe"], 2),
      ];

    case "vuot-den-do-hieu-lenh":
      return [
        quiz("Thứ tự ưu tiên chấp hành hệ thống báo hiệu đường bộ nào sau đây là đúng quy định?", "Hệ thống báo hiệu tuân thủ thứ tự: Hiệu lệnh người điều khiển -> Tín hiệu đèn -> Biển báo -> Vạch kẻ đường.", ["Hiệu lệnh người điều khiển -> Tín hiệu đèn -> Biển báo -> Vạch kẻ đường", "Biển báo -> Tín hiệu đèn -> Vạch kẻ đường -> Hiệu lệnh người điều khiển", "Tín hiệu đèn -> Biển báo -> Hiệu lệnh người điều khiển -> Vạch kẻ đường", "Tất cả đều có giá trị ngang nhau"], 0),
        quiz("Khi CSGT giơ hai tay hoặc một tay dang ngang, người tham gia giao thông phải chấp hành thế nào?", "Người tham gia giao thông ở phía trước và phía sau người điều khiển phải dừng lại; ở phía bên phải và bên trái được đi.", ["Phía trước và phía sau dừng lại; phía bên phải và bên trái được đi", "Tất cả các hướng đều phải dừng lại", "Tất cả các hướng đều được đi tiếp", "Người đi xe máy phải xuống xe dắt bộ"], 0),
        quiz("Tín hiệu vàng của đèn giao thông báo hiệu điều gì cho người lái xe?", "Phải dừng lại trước vạch dừng; nếu đã đi quá vạch hoặc quá gần vạch dừng nếu dừng lại thấy nguy hiểm thì được đi tiếp.", ["Phải dừng lại trước vạch dừng (trừ trường hợp đã đi quá vạch dừng)", "Được tăng tốc để đi qua thật nhanh", "Được đi tiếp bình thường không cần giảm tốc", "Báo hiệu làn đường sắp bị đóng"], 0),
        quiz("Hành vi vượt đèn đỏ, vượt đèn vàng đối với người đi xe máy bị phạt tiền bao nhiêu?", "Phạt tiền từ 800.000đ đến 1.000.000đ đối với người đi xe máy vượt đèn đỏ/vàng.", ["200.000đ - 300.000đ", "400.000đ - 600.000đ", "800.000đ - 1.000.000đ", "2.000.000đ - 3.000.000đ"], 2),
        quiz("Hành vi vượt đèn đỏ, vượt đèn vàng đối với người lái xe ô tô bị phạt tiền bao nhiêu?", "Phạt tiền từ 4.000.000đ đến 6.000.000đ đối với xe ô tô vượt đèn đỏ/vàng.", ["1.000.000đ - 2.000.000đ", "2.000.000đ - 3.000.000đ", "4.000.000đ - 6.000.000đ", "10.000.000đ - 12.000.000đ"], 2),
        quiz("Người điều khiển xe máy vượt đèn đỏ ngoài bị phạt tiền còn bị áp dụng hình thức phạt bổ sung nào?", "Bị tước quyền sử dụng Giấy phép lái xe từ 01 đến 03 tháng.", ["Tước GPLX từ 1 đến 3 tháng", "Tạm giữ phương tiện 30 ngày", "Phạt lao động công ích", "Tước GPLX vĩnh viễn"], 0),
        quiz("Gặp biển báo hiệu cố định và biển báo hiệu tạm thời có nội dung khác nhau, người lái xe phải chấp hành theo biển nào?", "Người tham gia giao thông phải chấp hành hiệu lệnh của biển báo hiệu tạm thời.", ["Biển báo hiệu cố định", "Biển báo hiệu tạm thời", "Tự lựa chọn biển báo thuận tiện hơn", "Không chấp hành cả hai"], 1),
        quiz("Xe ưu tiên (như cứu thương, cứu hỏa) khi đang làm nhiệm vụ khẩn cấp có tín hiệu còi, cờ, đèn có được đi qua khi đèn đỏ không?", "Có, xe ưu tiên khi đi làm nhiệm vụ được phép đi vào đường ngược chiều, đi qua đèn đỏ và các đường cấm khác.", ["Không được phép", "Được phép đi qua khi có tín hiệu còi, đèn ưu tiên theo quy định", "Chỉ được đi qua vào ban đêm", "Chỉ được đi qua khi CSGT cho phép"], 1),
        quiz("Người đi bộ vượt đèn đỏ có bị xử phạt hành chính không?", "Có, người đi bộ không chấp hành hiệu lệnh đèn tín hiệu bị phạt tiền từ 60.000đ đến 100.000đ.", ["Không bị phạt", "Chỉ bị nhắc nhở", "Có bị phạt tiền hành chính", "Chỉ phạt khi xảy ra tai nạn"], 2),
        quiz("Hành vi vượt đèn đỏ gây tai nạn giao thông đối với người đi xe máy bị tước GPLX bao lâu?", "Bị tước quyền sử dụng Giấy phép lái xe từ 02 đến 04 tháng.", ["1 - 2 tháng", "2 - 4 tháng", "3 - 5 tháng", "6 - 12 tháng"], 1),
      ];

    case "di-nguoc-chieu-sai-lan":
      return [
        quiz("Hành vi đi xe máy không đúng làn đường hoặc phần đường quy định (đi sai làn) bị phạt tiền bao nhiêu?", "Phạt tiền từ 400.000đ đến 600.000đ đối với hành vi đi sai làn đường.", ["100.000đ - 200.000đ", "400.000đ - 600.000đ", "1.000.000đ - 2.000.000đ", "3.000.000đ - 4.000.000đ"], 1),
        quiz("Hành vi điều khiển xe máy đi ngược chiều của đường một chiều hoặc đi vào đường có biển cấm đi ngược chiều bị phạt bao nhiêu?", "Phạt tiền từ 1.000.000đ đến 2.000.000đ đối với người đi xe máy ngược chiều.", ["200.000đ - 300.000đ", "500.000đ - 1.000.000đ", "1.000.000đ - 2.000.000đ", "3.000.000đ - 4.000.000đ"], 2),
        quiz("Người điều khiển ô tô đi ngược chiều trên đường cao tốc bị xử phạt thế nào?", "Phạt tiền từ 16.000.000đ đến 18.000.000đ và tước quyền sử dụng GPLX từ 05 đến 07 tháng.", ["Phạt tiền 1-2 triệu đồng", "Phạt tiền 16 - 18 triệu đồng và tước GPLX 5-7 tháng", "Chỉ tịch thu xe", "Phạt tù từ 1 đến 3 năm"], 1),
        quiz("Thế nào là lỗi đi sai làn đường (khác với lỗi không chấp hành vạch kẻ đường)?", "Đi sai làn đường là di chuyển vào làn đường dành cho phương tiện khác; không chấp hành vạch kẻ đường là đi sai hướng mũi tên chỉ dẫn trên làn đường đó.", ["Đi vào làn đường dành riêng cho phương tiện khác", "Đè lên vạch kẻ đường nét đứt", "Rẽ hướng tại nơi không có biển báo", "Chạy xe quá tốc độ"], 0),
        quiz("Hành vi không chấp hành chỉ dẫn của biển báo hiệu, vạch kẻ đường đối với xe máy bị phạt tiền bao nhiêu?", "Phạt tiền từ 100.000đ đến 200.000đ đối với xe máy không tuân thủ biển báo/vạch kẻ đường.", ["100.000đ - 200.000đ", "300.000đ - 400.000đ", "600.000đ - 800.000đ", "1.000.000đ - 2.000.000đ"], 0),
        quiz("Người điều khiển xe máy đi ngược chiều gây tai nạn giao thông bị tước GPLX trong thời gian bao lâu?", "Bị tước quyền sử dụng Giấy phép lái xe từ 02 đến 04 tháng.", ["1 - 2 tháng", "2 - 4 tháng", "3 - 5 tháng", "6 - 12 tháng"], 1),
        quiz("Mức phạt tiền đối với người đi xe máy đi sai làn đường gây tai nạn giao thông là bao nhiêu?", "Phạt tiền từ 4.000.000đ đến 5.000.000đ và tước quyền sử dụng GPLX từ 02 đến 04 tháng.", ["1 - 2 triệu đồng", "2 - 3 triệu đồng", "4 - 5 triệu đồng", "6 - 8 triệu đồng"], 2),
        quiz("Vạch kẻ đường phân chia các làn xe chạy cùng chiều có đặc điểm gì?", "Vạch đứt hoặc liền nét có màu trắng.", ["Vạch đứt màu vàng", "Vạch nét liền hoặc đứt có màu trắng", "Vạch màu đỏ", "Vạch ziczac màu xanh"], 1),
        quiz("Vạch kẻ đường phân chia hai chiều xe chạy ngược chiều (vạch tim đường) có màu gì?", "Các vạch phân chia hai chiều xe chạy ngược chiều thường có màu vàng.", ["Màu trắng", "Màu vàng", "Màu xanh", "Màu cam"], 1),
        quiz("Biển báo cấm đi ngược chiều có hình dạng và màu sắc thế nào?", "Biển tròn, nền đỏ, có vạch ngang màu trắng ở giữa.", ["Biển tròn, nền xanh, viền đỏ", "Biển tròn, nền đỏ, có vạch ngang màu trắng ở giữa", "Biển tam giác vàng viền đỏ", "Biển hình vuông nền xanh"], 1),
      ];

    case "doi-mu-bao-hiem-quy-dinh":
      return [
        quiz("Đối tượng nào bắt buộc phải đội mũ bảo hiểm khi đi xe mô tô, xe gắn máy, xe đạp điện?", "Người điều khiển phương tiện và người được chở trên xe bắt buộc phải đội mũ bảo hiểm cài quai đúng quy cách.", ["Chỉ người lái xe", "Người điều khiển và người ngồi trên xe", "Chỉ trẻ em trên xe", "Chỉ người ngồi sau xe"], 1),
        quiz("Trẻ em từ mấy tuổi trở lên bắt buộc phải đội mũ bảo hiểm khi ngồi trên xe mô tô, xe máy?", "Trẻ em từ đủ 06 tuổi trở lên bắt buộc phải đội mũ bảo hiểm.", ["Đủ 3 tuổi", "Đủ 5 tuổi", "Đủ 6 tuổi", "Đủ 10 tuổi"], 2),
        quiz("Hành vi không đội mũ bảo hiểm hoặc đội mũ bảo hiểm không cài quai đúng quy cách bị phạt tiền bao nhiêu?", "Phạt tiền từ 400.000đ đến 600.000đ theo Nghị định 100/2019/NĐ-CP (sửa đổi bởi Nghị định 123/2021/NĐ-CP).", ["100.000đ - 200.000đ", "200.000đ - 300.000đ", "400.000đ - 600.000đ", "800.000đ - 1.000.000đ"], 2),
        quiz("Mũ bảo hiểm đạt chuẩn chất lượng cho người đi mô tô, xe máy bắt buộc phải có nhãn hiệu chứng nhận nào?", "Phải dán dấu hợp quy CR theo Quy chuẩn kỹ thuật quốc gia.", ["Tem chống hàng giả QCVN", "Dấu chứng nhận hợp quy CR", "Tem bảo hành 1 năm", "Chữ ISO 9001"], 1),
        quiz("Đội mũ bảo hiểm nhưng không cài quai đúng quy cách khi đi xe máy bị phạt thế nào?", "Bị xử phạt tiền tương đương với lỗi không đội mũ bảo hiểm.", ["Chỉ bị nhắc nhở", "Phạt tiền như lỗi không đội mũ bảo hiểm", "Phạt tiền bằng một nửa lỗi không đội mũ", "Không bị xử phạt"], 1),
        quiz("Người điều khiển xe máy chở người ngồi sau không đội mũ bảo hiểm (trừ trường hợp khẩn cấp) bị phạt bao nhiêu?", "Phạt tiền người điều khiển từ 400.000đ đến 600.000đ về hành vi chở người ngồi sau không đội mũ bảo hiểm.", ["100.000đ - 200.000đ", "200.000đ - 300.000đ", "400.000đ - 600.000đ", "800.000đ - 1.000.000đ"], 2),
        quiz("Trường hợp chở người ngồi sau không đội mũ bảo hiểm nào dưới đây thì người lái xe KHÔNG bị phạt?", "Chở người bệnh đi cấp cứu; trẻ em dưới 06 tuổi; áp giải người có hành vi vi phạm pháp luật.", ["Trẻ em dưới 06 tuổi hoặc chở người bệnh đi cấp cứu", "Chở bạn bè cùng lớp đi học", "Chở người già trên 70 tuổi", "Chở người có cân nặng trên 80kg"], 0),
        quiz("Tác dụng chính của việc đội mũ bảo hiểm đạt chuẩn là gì?", "Giảm thiểu chấn thương sọ não và bảo vệ vùng đầu khi xảy ra va chạm giao thông.", ["Tránh gió bụi và nắng mưa", "Giảm mức độ chấn thương vùng đầu khi xảy ra tai nạn", "Làm đẹp cho người lái xe", "Để đối phó với cảnh sát giao thông"], 1),
        quiz("Cấu tạo chuẩn của mũ bảo hiểm cho người đi mô tô, xe máy gồm mấy bộ phận chính?", "Vỏ mũ; đệm hấp thụ xung động (xốp bên trong); quai đeo và khóa giữ.", ["Vỏ mũ và kính chắn gió", "Vỏ mũ, đệm hấp thụ xung động, quai đeo", "Vỏ mũ và đệm lót vải", "Chỉ cần vỏ mũ nhựa cứng"], 1),
        quiz("Người ngồi trên xe máy điện, xe đạp điện có bắt buộc phải đội mũ bảo hiểm cài quai đúng quy cách không?", "Có bắt buộc đối với cả xe máy điện và xe đạp điện khi tham gia giao thông.", ["Không cần thiết", "Chỉ bắt buộc đối với xe máy điện", "Bắt buộc đối với cả xe máy điện và xe đạp điện", "Chỉ bắt buộc khi đi trên quốc lộ"], 2),
      ];

    case "xe-khong-chinh-chu":
      return [
        quiz("Lỗi 'không làm thủ tục đăng ký sang tên xe' (xe không chính chủ) bị xử phạt trong trường hợp nào?", "Chỉ bị xác minh và xử phạt qua công tác điều tra giải quyết tai nạn giao thông hoặc qua công tác đăng ký sang tên di chuyển xe.", ["Khi CSGT dừng xe kiểm tra hành chính thông thường", "Qua công tác điều tra giải quyết tai nạn giao thông hoặc đăng ký sang tên di chuyển xe", "Khi đi đăng kiểm định kỳ", "Khi gửi xe tại bãi xe công cộng"], 1),
        quiz("Đi xe mượn của bố mẹ, vợ chồng hoặc bạn bè khi đi đường có bị xử phạt lỗi xe không chính chủ không?", "Không, pháp luật không nghiêm cấm và không xử phạt hành vi mượn xe của người thân đi đường.", ["Có bị phạt nếu không có giấy ủy quyền", "Không bị xử phạt lỗi xe không chính chủ", "Chỉ bị phạt khi đi vào ban đêm", "Chỉ bị phạt khi đi tỉnh khác"], 1),
        quiz("Thời hạn người mua hoặc người nhận xe phải làm thủ tục sang tên xe kể từ ngày nhận quyền sở hữu là bao nhiêu ngày?", "Thời hạn là trong vòng 30 ngày kể từ ngày làm chứng từ chuyển quyền sở hữu xe.", ["10 ngày", "15 ngày", "30 ngày", "60 ngày"], 2),
        quiz("Mức phạt tiền đối với cá nhân không làm thủ tục đăng ký sang tên xe máy theo quy định là bao nhiêu?", "Phạt tiền từ 400.000đ đến 600.000đ đối với cá nhân không sang tên xe máy.", ["100.000đ - 200.000đ", "400.000đ - 600.000đ", "1.000.000đ - 2.000.000đ", "2.000.000đ - 4.000.000đ"], 1),
        quiz("Mức phạt tiền đối với cá nhân không làm thủ tục đăng ký sang tên xe ô tô theo quy định là bao nhiêu?", "Phạt tiền từ 2.000.000đ đến 4.000.000đ đối với cá nhân không sang tên ô tô.", ["500.000đ - 1.000.000đ", "1.000.000đ - 2.000.000đ", "2.000.000đ - 4.000.000đ", "4.000.000đ - 6.000.000đ"], 2),
        quiz("Khi mua bán xe, bên nào có trách nhiệm làm thủ tục thu hồi đăng ký, biển số xe tại cơ quan công an?", "Chủ xe (người bán) có trách nhiệm làm thủ tục thu hồi đăng ký, biển số xe trước khi bàn giao xe.", ["Người mua xe", "Chủ xe (người bán)", "Cửa hàng bán xe hộ", "Người môi giới xe"], 1),
        quiz("Giấy tờ nào dưới đây được coi là chứng từ chuyển quyền sở hữu xe hợp lệ?", "Quyết định bán, cho tặng xe hoặc hợp đồng mua bán xe có công chứng, chứng thực theo quy định pháp luật.", ["Giấy viết tay không có công chứng", "Hợp đồng mua bán được công chứng hoặc chứng thực hợp lệ", "Lời hứa miệng của người bán", "Tin nhắn thỏa thuận qua Zalo"], 1),
        quiz("Rủi ro lớn nhất cho người bán khi bán xe nhưng không làm thủ tục thu hồi đăng ký, sang tên là gì?", "Có thể bị liên đới trách nhiệm pháp lý hoặc bồi thường thiệt hại nếu xe đó gây tai nạn nghiêm trọng hoặc liên quan đến tội phạm.", ["Bị phạt tiền hàng ngày", "Bị liên đới trách nhiệm khi xe gây tai nạn hoặc liên quan đến hành vi phạm pháp", "Bị tịch thu hộ khẩu", "Không được mua xe mới"], 1),
        quiz("Rủi ro cho người mua khi đi xe không chính chủ chưa làm thủ tục sang tên là gì?", "Gặp khó khăn khi chứng minh quyền sở hữu, không được cấp lại giấy tờ khi bị mất, không thể tự bán hoặc thế chấp xe.", ["Không thể tự đăng ký bảo hiểm tự nguyện", "Gặp khó khăn chứng minh sở hữu khi mất giấy tờ, tranh chấp hoặc muốn bán xe", "Bị CSGT tạm giữ xe mỗi khi ra đường", "Bị khóa tài khoản định danh điện tử"], 1),
        quiz("Thủ tục sang tên xe máy hiện nay được thực hiện tại cơ quan nào?", "Công an cấp xã, phường được phân cấp hoặc Công an cấp quận, huyện nơi người mua cư trú.", ["Ủy ban nhân dân cấp xã", "Cơ quan đăng ký xe thuộc Công an cấp huyện hoặc cấp xã được phân cấp", "Sở Giao thông vận tải", "Văn phòng công chứng"], 1),
      ];

    case "nhuong-duong-nga-tu":
      return [
        quiz("Tại nơi đường giao nhau không có biển báo đi theo vòng xuyến, người lái xe phải nhường đường thế nào?", "Phải nhường đường cho xe đi đến từ bên phải.", ["Nhường đường cho xe đi đến từ bên trái", "Nhường đường cho xe đi đến từ bên phải", "Nhường đường cho xe có kích thước lớn hơn", "Xe nào còi to hơn được đi trước"], 1),
        quiz("Tại nơi đường giao nhau có biển báo hiệu đi theo vòng xuyến, nhường đường thế nào?", "Phải nhường đường cho xe đi bên trái (xe đang ở trong vòng xuyến).", ["Nhường đường cho xe đi từ bên phải", "Nhường đường cho xe đi bên trái", "Nhường đường cho xe đi thẳng", "Xe nào có tốc độ cao hơn được đi trước"], 1),
        quiz("Khi điều khiển xe từ đường ngõ, đường nhánh ra đường chính, người lái xe phải nhường đường thế nào?", "Phải nhường đường cho xe đang đi trên đường ưu tiên hoặc đường chính từ bất kỳ hướng nào tới.", ["Chỉ nhường cho xe đi từ bên phải", "Chỉ nhường cho xe đi từ bên trái", "Nhường đường cho xe đi trên đường ưu tiên hoặc đường chính từ bất kỳ hướng nào tới", "Được quyền đi trước nếu bật đèn khẩn cấp"], 2),
        quiz("Thứ tự ưu tiên đi tại ngã tư không có đèn tín hiệu và không có biển báo đường ưu tiên thế nào?", "1. Xe đã vào giao lộ; 2. Xe ưu tiên; 3. Xe đi đường ưu tiên; 4. Xe bên phải không vướng.", ["Xe đi thẳng -> Xe rẽ phải -> Xe rẽ trái", "Xe ưu tiên -> Xe đã vào giao lộ -> Xe rẽ phải", "Xe đã vào giao lộ -> Xe ưu tiên -> Xe đi trên đường ưu tiên -> Xe bên phải không vướng", "Xe ô tô -> Xe máy -> Xe thô sơ"], 2),
        quiz("Hành vi không nhường đường cho xe xin vượt khi có đủ điều kiện an toàn đối với xe máy bị phạt bao nhiêu?", "Phạt tiền từ 300.000đ đến 400.000đ đối với người đi xe máy không nhường đường cho xe khác vượt.", ["100.000đ - 200.000đ", "300.000đ - 400.000đ", "600.000đ - 800.000đ", "1.000.000đ - 2.000.000đ"], 1),
        quiz("Khi rẽ trái tại nơi giao lộ, người lái xe phải nhường đường cho đối tượng nào?", "Nhường đường cho người đi bộ đang qua đường và các xe đi ngược chiều đi thẳng.", ["Nhường đường cho xe rẽ phải cùng chiều", "Nhường đường cho người đi bộ đang qua đường và xe đi ngược chiều đi thẳng", "Không cần nhường vì rẽ trái là hướng ưu tiên", "Nhường cho xe đi sau mình"], 1),
        quiz("Khi gặp xe ưu tiên (như cứu thương, cứu hỏa) đang phát tín hiệu khẩn cấp, bạn phải làm gì?", "Nhanh chóng giảm tốc độ, tránh hoặc dừng lại sát lề đường bên phải để nhường đường, không được cản trở.", ["Tăng tốc để chạy trước xe ưu tiên", "Nhanh chóng giảm tốc, tránh hoặc dừng sát lề phải để nhường đường", "Giữ nguyên tốc độ và đi giữa đường", "Bật đèn khẩn cấp và đi song song"], 1),
        quiz("Tại nơi giao nhau giữa đường ưu tiên và đường không ưu tiên, xe nào được quyền đi trước?", "Xe đang đi trên đường ưu tiên được quyền đi trước bất kể đi từ hướng nào tới.", ["Xe đi từ phía bên phải", "Xe đi từ phía bên trái", "Xe đang đi trên đường ưu tiên", "Xe có kích thước lớn hơn"], 2),
        quiz("Hành vi không nhường đường cho xe ưu tiên đang phát tín hiệu làm nhiệm vụ bị phạt tiền bao nhiêu đối với ô tô?", "Phạt tiền từ 6.000.000đ đến 8.000.000đ và tước GPLX từ 02 đến 04 tháng.", ["1 - 2 triệu đồng", "3 - 5 triệu đồng", "6 - 8 triệu đồng và tước GPLX 2-4 tháng", "10 - 12 triệu đồng"], 2),
        quiz("Quy tắc nhường đường cho người đi bộ tại nơi giao nhau được quy định thế nào?", "Phải giảm tốc độ hoặc dừng lại nhường đường cho người đi bộ đang đi trên phần đường dành cho họ qua đường.", ["Chỉ nhường khi người đi bộ vẫy tay xin đường", "Giảm tốc độ hoặc dừng lại nhường đường cho người đi bộ đang qua đường", "Chỉ nhường vào ban ngày", "Bấm còi liên tục báo hiệu để người đi bộ tránh"], 1),
      ];

    case "bao-mat-mang-xa-hoi":
      return [
        quiz("Tính năng xác thực 2 yếu tố (2FA) bảo vệ tài khoản mạng xã hội của bạn thế nào?", "Nó yêu cầu nhập mật khẩu và một mã xác thực dùng một lần (từ SMS hoặc app xác thực) khi đăng nhập thiết bị lạ.", ["Chỉ cho phép đăng nhập trên 1 điện thoại duy nhất", "Yêu cầu mật khẩu và mã xác thực OTP gửi riêng khi đăng nhập thiết bị mới", "Tự động đổi mật khẩu sau 30 ngày", "Quét khuôn mặt mỗi khi nhắn tin"], 1),
        quiz("Hành vi nào dưới đây giúp bảo mật tài khoản Facebook cá nhân hiệu quả nhất?", "Kích hoạt bảo mật hai lớp và tuyệt đối không nhấp vào các liên kết lạ.", ["Kết bạn với càng nhiều người càng tốt", "Kích hoạt xác thực 2 yếu tố và không nhấp vào link lạ", "Đặt ảnh đại diện là ảnh phong cảnh", "Ẩn toàn bộ bài đăng cũ"], 1),
        quiz("Khi nhận được tin nhắn từ tài khoản bạn bè yêu cầu click vào link bình chọn ảnh để giúp họ nhận giải, bạn nên xử lý thế nào?", "Không click vào link đó, tìm kênh liên lạc khác (gọi điện thoại trực tiếp) để xác minh xem tài khoản bạn bè có bị hack hay không.", ["Click ngay và đăng nhập tài khoản ủng hộ bạn", "Không click vào link, gọi điện trực tiếp xác minh với bạn bè", "Gửi tin nhắn hỏi tài khoản ngân hàng của họ", "Báo cáo link đó với Facebook rồi bấm thử"], 1),
        quiz("Kẻ xấu thường hack tài khoản Telegram bằng cách lừa nạn nhân thực hiện hành động nào?", "Lừa nạn nhân chụp màn hình tin nhắn Telegram (trong đó vô tình lộ mã kích hoạt đăng nhập thiết bị mới).", ["Yêu cầu quét mã QR mua sắm", "Lừa chụp màn hình tin nhắn chứa mã OTP kích hoạt Telegram", "Yêu cầu gửi số điện thoại cá nhân", "Yêu cầu cài đặt ứng dụng nghe nhạc"], 1),
        quiz("Đặt mật khẩu mạng xã hội thế nào là đạt chuẩn an toàn bảo mật?", "Mật khẩu dài từ 8 ký tự trở lên, gồm chữ hoa, chữ thường, số, ký tự đặc biệt và không chứa thông tin cá nhân dễ đoán.", ["Dùng số điện thoại của mình để dễ nhớ", "Đặt mật khẩu dài có chữ hoa, thường, số, ký tự đặc biệt và không trùng lặp", "Đặt mật khẩu giống với tên tài khoản", "Đặt chuỗi số từ 1 đến 8"], 1),
        quiz("Tính năng 'Cảnh báo đăng nhập lạ' trên Facebook có tác dụng gì?", "Gửi thông báo ngay lập tức qua ứng dụng hoặc email khi có thiết bị hoặc trình duyệt lạ đăng nhập vào tài khoản của bạn.", ["Tự động khóa tài khoản khi có người đăng nhập lạ", "Gửi cảnh báo đến email/tin nhắn khi phát hiện đăng nhập lạ", "Xóa toàn bộ tin nhắn cũ khi đăng nhập thiết bị mới", "Chụp ảnh camera của người đang cố đăng nhập trái phép"], 1),
        quiz("Tại sao không nên sử dụng tính năng 'Lưu mật khẩu' trên trình duyệt web của máy tính công cộng?", "Vì người sử dụng máy tính sau đó có thể dễ dàng truy cập và lấy cắp mật khẩu tài khoản mạng xã hội của bạn.", ["Làm trình duyệt chạy chậm hơn", "Tránh nguy cơ bị người dùng sau đó lấy cắp tài khoản", "Vì trình duyệt sẽ tự động gửi mật khẩu cho Google", "Làm máy tính dễ bị nhiễm virus"], 1),
        quiz("Khi tài khoản Facebook của bạn bị hack và gửi tin nhắn mượn tiền hàng loạt bạn bè, việc đầu tiên cần làm là gì?", "Dùng các phương tiện liên lạc khác báo ngay cho bạn bè và người thân biết tài khoản đã bị chiếm quyền.", ["Đợi Facebook tự động khôi phục tài khoản", "Gọi điện báo ngay cho người thân và bạn bè để họ cảnh giác không chuyển tiền", "Đăng đơn tố cáo lên công an quận ngay lập tức", "Xóa sim điện thoại đang dùng"], 1),
        quiz("Kiểm tra lịch sử các thiết bị đang đăng nhập tài khoản (Logins) giúp ích gì cho bạn?", "Nhận diện xem có thiết bị lạ nào đang đăng nhập tài khoản của mình và thực hiện đăng xuất từ xa.", ["Xem vị trí của bạn bè xung quanh", "Phát hiện thiết bị lạ và đăng xuất từ xa khỏi các thiết bị đó", "Tăng tốc độ kết nối mạng xã hội", "Biết được ai đang xem trang cá nhân của mình"], 1),
        quiz("Việc cấp quyền truy cập tài khoản mạng xã hội cho các ứng dụng trắc nghiệm vui (như 'Xem dung nhan của bạn 10 năm sau') có rủi ro gì?", "Kẻ xấu có thể thu thập thông tin cá nhân của bạn, danh sách bạn bè và sử dụng tài khoản để spam link rác.", ["Làm hỏng camera điện thoại", "Bị lộ dữ liệu cá nhân hoặc tài khoản bị lợi dụng spam link quảng cáo", "Điện thoại bị trừ tiền tài khoản", "Không có rủi ro nào"], 1),
      ];

    case "canh-giac-phan-mem-doc-hai":
      return [
        quiz("Phần mềm độc hại (Malware) bao gồm những loại mã độc nào sau đây?", "Malware là thuật ngữ chung gồm virus, trojan, spyware, ransomware, phần mềm quảng cáo độc hại.", ["Chỉ bao gồm virus máy tính", "Virus, trojan, spyware, ransomware, phần mềm quảng cáo", "Các ứng dụng chạy ngầm hệ điều hành", "Các tệp tin rác trong thùng rác"], 1),
        quiz("Phần mềm độc hại thường xâm nhập vào thiết bị cá nhân qua con đường phổ biến nào?", "Tải các tệp crack phần mềm lậu, click vào link lạ từ email rác hoặc cắm USB bị nhiễm độc.", ["Tải game từ kho ứng dụng chính thức App Store", "Tải tệp crack lậu, mở link đính kèm email rác hoặc cắm USB lạ", "Truy cập các trang báo điện tử chính thống", "Sử dụng tai nghe Bluetooth"], 1),
        quiz("Mục đích chính của phần mềm gián điệp (Spyware) khi cài vào máy nạn nhân là gì?", "Âm thầm theo dõi hành vi người dùng, chụp màn hình, ghi lại mật khẩu và đánh cắp thông tin thẻ ngân hàng.", ["Hiển thị quảng cáo kiếm tiền", "Theo dõi hoạt động, đánh cắp mật khẩu và dữ liệu nhạy cảm của người dùng", "Khóa dữ liệu đòi tiền chuộc", "Tự động tắt máy tính khi quá nóng"], 1),
        quiz("Mã độc dạng 'Trojan' hoạt động dựa trên cơ chế nào?", "Ẩn mình dưới vỏ bọc một phần mềm có vẻ hữu ích và an toàn để lừa người dùng tải về cài đặt.", ["Tự động nhân bản lây lan qua mạng LAN", "Ẩn mình dưới dạng phần mềm an toàn để lừa người dùng cài đặt", "Tự động xóa sạch dữ liệu ổ cứng", "Gửi hàng loạt email spam từ tài khoản nạn nhân"], 1),
        quiz("Dấu hiệu nào dưới đây cho thấy điện thoại hoặc máy tính của bạn có khả năng cao đã nhiễm mã độc?", "Thiết bị nóng lên bất thường, pin tụt nhanh, tự động mở ứng dụng lạ hoặc xuất hiện liên tục popup quảng cáo rác.", ["Thiết bị chạy mượt mà và mát mẻ", "Thiết bị sụt pin nhanh, xuất hiện nhiều quảng cáo lạ hoặc ứng dụng lạ", "Bộ nhớ trống tăng lên", "Ứng dụng cập nhật phiên bản mới"], 1),
        quiz("Tác hại của phần mềm quảng cáo độc hại (Adware) là gì?", "Tự động hiển thị các quảng cáo rác ngoài ý muốn, chuyển hướng trình duyệt đến trang độc hại.", ["Mã hóa toàn bộ ảnh và tài liệu", "Tự động cài quảng cáo rác và chuyển hướng đến trang web nguy hiểm", "Đánh cắp mật khẩu tài khoản ngân hàng", "Ngăn chặn máy tính kết nối Wifi"], 1),
        quiz("Cách phòng ngừa mã độc hiệu quả nhất khi tải ứng dụng trên điện thoại di động là gì?", "Chỉ tải ứng dụng từ cửa hàng chính thức (App Store, Google Play), tuyệt đối không cài tệp .APK trôi nổi.", ["Tải bất kỳ tệp cài đặt nào tìm thấy trên Google", "Chỉ tải ứng dụng từ App Store/Google Play và kiểm tra kỹ quyền truy cập", "Cài đặt nhiều ứng dụng diệt virus khác nhau", "Không cập nhật hệ điều hành mới"], 1),
        quiz("Tường lửa (Firewall) tích hợp trên hệ điều hành máy tính có chức năng gì?", "Giám sát và kiểm soát lưu lượng mạng ra vào thiết bị dựa trên quy tắc an ninh, chặn các kết nối độc hại.", ["Diệt sạch virus trên ổ cứng", "Giám sát, kiểm soát lưu lượng mạng ra vào thiết bị", "Tăng tốc độ truy cập Internet", "Dọn dẹp các tệp tin tạm thời"], 1),
        quiz("Trình duyệt cảnh báo 'Tệp tải xuống này có thể gây nguy hại cho máy tính', bạn nên xử lý thế nào?", "Hủy tải xuống ngay lập tức và xóa tệp tin đó khỏi thiết bị.", ["Bỏ qua cảnh báo và tiếp tục mở tệp", "Hủy tải xuống và xóa tệp tin nghi ngờ ngay lập tức", "Đổi tên tệp rồi mở lại", "Tắt phần mềm diệt virus rồi chạy tệp"], 1),
        quiz("Tại sao việc thường xuyên cập nhật hệ điều hành (Windows, iOS, Android) lại quan trọng trong bảo mật?", "Để vá các lỗ hổng bảo mật hệ thống mà tin tặc có thể khai thác để cài đặt mã độc trái phép.", ["Để giao diện trông đẹp mắt hơn", "Để vá các lỗ hổng bảo mật giúp thiết bị chống lại mã độc mới", "Để xóa bớt các tệp tin cũ của người dùng", "Để tiết kiệm dung lượng bộ nhớ"], 1),
      ];

    case "sao-luu-du-lieu-ransomware":
      return [
        quiz("Ransomware (mã hóa tống tiền) thực hiện hành vi nguy hại nào trên máy tính nạn nhân?", "Nó tự động mã hóa tất cả các tệp tài liệu, hình ảnh quan trọng và yêu cầu nạn nhân trả tiền chuộc để lấy khóa giải mã.", ["Đánh cắp mật khẩu đăng nhập Facebook", "Mã hóa tệp dữ liệu quan trọng và đòi tiền chuộc để giải mã", "Gửi email rác cho đồng nghiệp", "Tự động xóa hệ điều hành Windows"], 1),
        quiz("Theo quy tắc sao lưu dữ liệu 3-2-1, bạn nên chuẩn bị các bản sao lưu thế nào?", "Lưu trữ ít nhất 3 bản sao của dữ liệu, trên 2 loại phương tiện khác nhau và 1 bản lưu ngoại tuyến (offline).", ["Lưu 3 bản trên 1 ổ cứng di động duy nhất", "Lưu 3 bản sao, trên 2 phương tiện khác nhau, có 1 bản ngoại tuyến (offline)", "Lưu 3 bản sao trên Google Drive của 3 tài khoản khác nhau", "Lưu 3 bản sao lưu trong 3 thư mục khác nhau trên cùng một máy tính"], 1),
        quiz("Tại sao bản sao lưu ngoại tuyến (Offline Backup) là giải pháp tốt nhất chống lại Ransomware?", "Vì bản sao lưu offline hoàn toàn cách ly với máy tính và mạng internet, mã độc Ransomware không thể truy cập để mã hóa nó.", ["Vì bản sao lưu offline rẻ hơn lưu trữ đám mây", "Vì nó được cách ly hoàn toàn với thiết bị đang kết nối mạng nên không bị mã độc tấn công", "Vì bản sao lưu offline tự động diệt virus", "Vì sao lưu offline có dung lượng lớn hơn"], 1),
        quiz("Khi phát hiện màn hình máy tính hiển thị thông báo đòi tiền chuộc và các tệp tin bị đổi đuôi lạ, việc đầu tiên cần làm là gì?", "Ngay lập tức rút cáp mạng lan hoặc tắt kết nối Wifi để cô lập máy tính tránh lây lan mã độc sang các máy khác cùng mạng.", ["Chuyển khoản ngay tiền chuộc cho tin tặc", "Ngắt kết nối mạng (cáp LAN, Wifi) ngay lập tức để cô lập thiết bị", "Tải phần mềm diệt virus mới về quét", "Khởi động lại máy tính nhiều lần"], 1),
        quiz("Có nên thanh toán tiền chuộc cho tin tặc khi bị Ransomware tấn công không?", "Không nên, vì không có gì bảo đảm tin tặc sẽ gửi khóa giải mã hoạt động được và việc thanh toán sẽ tài trợ cho tội phạm công nghệ cao.", ["Nên trả tiền ngay để lấy lại dữ liệu nhanh nhất", "Không nên trả tiền vì không chắc nhận được khóa giải mã và khuyến khích tội phạm tiếp tục", "Chỉ trả một nửa số tiền yêu cầu", "Trả tiền và yêu cầu họ ký biên bản cam kết bảo mật"], 1),
        quiz("Các công cụ sao lưu đám mây tự động đồng bộ (như Google Drive, OneDrive) có rủi ro gì khi bị Ransomware tấn công?", "Nếu không kích hoạt tính năng lưu lịch sử phiên bản (Version History), tệp tin bị mã hóa trên máy tính sẽ tự động đồng bộ và đè lên tệp sạch trên đám mây.", ["Làm mất tài khoản đăng nhập đám mây", "Tệp đã bị mã hóa tự động đồng bộ đè lên tệp sạch trên đám mây nếu không bật tính năng lưu phiên bản", "Làm rò rỉ mật khẩu email liên kết", "Ứng dụng đám mây tự động bị xóa"], 1),
        quiz("Ransomware thường lây lan rộng rãi nhất qua phương thức nào?", "Qua các chiến dịch email giả mạo (phishing) chứa liên kết độc hại hoặc tệp đính kèm chứa mã độc dưới dạng hóa đơn, báo giá.", ["Qua sóng điện thoại di động", "Qua email giả mạo chứa liên kết hoặc tệp đính kèm chứa mã độc", "Qua việc cắm sạc pin điện thoại", "Qua tin nhắn SMS văn bản thuần túy"], 1),
        quiz("Shadow Copies (tính năng khôi phục hệ thống của Windows) có bảo vệ dữ liệu an toàn trước Ransomware không?", "Không, hầu hết các dòng Ransomware hiện đại đều tự động tìm và xóa sạch các bản Shadow Copies trước khi bắt đầu mã hóa dữ liệu.", ["Có, bảo vệ an toàn 100%", "Không, Ransomware hiện đại thường tự động tìm và xóa Shadow Copies trước khi mã hóa", "Chỉ bảo vệ được các tệp hình ảnh", "Chỉ hoạt động khi máy tính tắt nguồn"], 1),
        quiz("Phương thức tống tiền kép (Double Extortion) của tin tặc Ransomware hiện nay là gì?", "Ngoài việc mã hóa dữ liệu đòi tiền giải mã, chúng còn đe dọa tung dữ liệu nhạy cảm của nạn nhân lên mạng nếu không nộp tiền.", ["Đòi tiền chuộc gấp đôi số tiền ban đầu", "Mã hóa dữ liệu và đe dọa tung dữ liệu nhạy cảm của nạn nhân lên mạng xã hội", "Hack thêm tài khoản ngân hàng của người thân nạn nhân", "Khóa luôn nguồn điện của doanh nghiệp"], 1),
        quiz("Việc định kỳ thực hiện thử nghiệm khôi phục dữ liệu từ bản sao lưu (Restore Test) nhằm mục đích gì?", "Đảm bảo rằng các bản sao lưu thực sự hoạt động tốt, không bị lỗi dữ liệu và quy trình khôi phục diễn ra suôn sẻ khi có sự cố thực tế.", ["Để kiểm tra tốc độ internet của công ty", "Đảm bảo bản sao lưu hoạt động tốt và dữ liệu khôi phục toàn vẹn khi xảy ra sự cố thật", "Để dọn dẹp các tệp tin trùng lặp trên ổ cứng", "Để cập nhật phiên bản mới cho hệ điều hành"], 1),
      ];

    case "bao-ve-thong-tin-ca-nhan":
      return [
        quiz("Theo quy định pháp luật Việt Nam, thông tin nào dưới đây thuộc nhóm dữ liệu cá nhân cơ bản?", "Dữ liệu cá nhân cơ bản bao gồm họ tên, ngày sinh, số điện thoại, địa chỉ liên hệ, ảnh chân dung, số CCCD.", ["Họ tên, ngày sinh, số điện thoại, số định danh cá nhân (CCCD)", "Lịch sử duyệt web cá nhân trên trình duyệt ẩn danh", "Sở thích ăn uống và thương hiệu thời trang yêu thích", "Tên con vật cưng trong gia đình"], 0),
        quiz("Nghị định quy định chi tiết về bảo vệ dữ liệu cá nhân tại Việt Nam hiện nay là nghị định nào?", "Nghị định 13/2023/NĐ-CP của Chính phủ về bảo vệ dữ liệu cá nhân có hiệu lực thi hành từ ngày 01/07/2023.", ["Nghị định 100/2019/NĐ-CP", "Nghị định 13/2023/NĐ-CP", "Nghị định 72/2013/NĐ-CP", "Nghị định 15/2020/NĐ-CP"], 1),
        quiz("Hành vi tự ý chia sẻ số điện thoại, ảnh chụp căn cước công dân của người khác lên mạng xã hội bị phạt thế nào?", "Bị xử phạt vi phạm hành chính về hành vi thu thập, sử dụng, phát tán dữ liệu cá nhân của người khác khi chưa được sự đồng ý.", ["Không bị phạt nếu không nhằm mục đích thương mại", "Bị xử phạt vi phạm hành chính đối với hành vi tiết lộ dữ liệu cá nhân trái phép", "Chỉ bị phạt khi người bị đăng ảnh gửi đơn khiếu nại lên công an", "Bị tước quyền công dân tạm thời"], 1),
        quiz("Tại sao việc công khai ảnh chụp hai mặt Căn cước công dân (CCCD) lên mạng xã hội lại cực kỳ nguy hiểm?", "Kẻ xấu có thể lấy cắp ảnh CCCD để đăng ký sim rác, mở tài khoản ngân hàng ảo hoặc đăng ký các khoản vay nợ tín dụng trực tuyến.", ["Làm giảm chất lượng hiển thị của ảnh trên mạng xã hội", "Kẻ xấu có thể lợi dụng để làm giả giấy tờ, đăng ký tài khoản ngân hàng ảo, sim rác hoặc vay tiền online", "Làm mất tính thẩm mỹ của trang cá nhân", "Làm vi phạm quy chuẩn cộng đồng về bản quyền hình ảnh"], 1),
        quiz("Quyền của chủ thể dữ liệu đối với dữ liệu cá nhân của mình bao gồm các quyền nào sau đây?", "Chủ thể dữ liệu có quyền được biết, đồng ý, truy cập, chỉnh sửa, xóa dữ liệu, hạn chế xử lý dữ liệu và khiếu nại bồi thường.", ["Quyền yêu cầu doanh nghiệp trả phí khi sử dụng dịch vụ của họ", "Quyền được biết, đồng ý, chỉnh sửa, xóa dữ liệu và yêu cầu ngừng xử lý dữ liệu", "Quyền thay đổi thông tin của người khác trên hệ thống", "Quyền sở hữu toàn bộ mã nguồn của ứng dụng thu thập dữ liệu"], 1),
        quiz("Khi cài đặt một ứng dụng chỉnh sửa ảnh đơn giản nhưng ứng dụng yêu cầu quyền truy cập danh bạ điện thoại và vị trí GPS, bạn nên làm gì?", "Từ chối cấp quyền truy cập danh bạ và vị trí vì các quyền này không liên quan trực tiếp đến tính năng sửa ảnh của ứng dụng.", ["Cấp quyền ngay để ứng dụng hoạt động đầy đủ tính năng", "Từ chối cấp quyền truy cập danh bạ và vị trí vì không cần thiết cho ứng dụng sửa ảnh", "Xóa toàn bộ danh bạ điện thoại trước khi bấm đồng ý", "Cung cấp danh bạ ảo để đánh lừa ứng dụng"], 1),
        quiz("Các cuộc gọi quảng cáo rác (bất động sản, khóa học) liên tục gọi đến số điện thoại của bạn thường xuất phát từ đâu?", "Do rò rỉ dữ liệu hoặc do các tổ chức, cá nhân mua bán trái phép danh sách số điện thoại khách hàng trên mạng.", ["Do nhà mạng tự động chia sẻ thông tin ngẫu nhiên", "Do rò rỉ dữ liệu hoặc mua bán trái phép danh sách thông tin số điện thoại của khách hàng", "Do hệ thống vệ tinh tự động quét số điện thoại đang hoạt động", "Do bạn vô tình bật tính năng định vị trên điện thoại"], 1),
        quiz("Hành vi mua bán dữ liệu cá nhân (như danh sách khách hàng VIP) tại Việt Nam bị xử lý thế nào?", "Bị xử phạt tiền hành chính rất nặng hoặc có thể bị truy cứu trách nhiệm hình sự về tội đưa hoặc sử dụng trái phép thông tin mạng máy tính.", ["Chỉ bị nhắc nhở rút kinh nghiệm", "Bị xử phạt hành chính nặng hoặc truy cứu trách nhiệm hình sự tùy theo mức độ vi phạm", "Được coi là hoạt động kinh doanh dữ liệu bình thường", "Chỉ phạt tiền đối với bên mua không phạt bên bán"], 1),
        quiz("Khi đăng ký thẻ thành viên tại các siêu thị hoặc cửa hàng tiện lợi, để hạn chế lộ lọt thông tin cá nhân, bạn nên làm gì?", "Đọc kỹ chính sách bảo mật, chỉ điền các thông tin bắt buộc, từ chối điền các thông tin nhạy cảm không cần thiết.", ["Điền đầy đủ tất cả thông tin kể cả tài khoản ngân hàng và địa chỉ cơ quan", "Chỉ điền các thông tin bắt buộc tối thiểu và đọc kỹ điều khoản bảo mật thông tin", "Nhờ nhân viên thu ngân điền hộ toàn bộ thông tin cá nhân", "Cung cấp thông tin của người thân trong gia đình"], 1),
        quiz("Tổ chức, cá nhân xử lý dữ liệu cá nhân phải thực hiện biện pháp gì để bảo vệ thông tin khách hàng?", "Phải áp dụng các biện pháp quản lý và kỹ thuật bảo mật (mã hóa dữ liệu, phân quyền truy cập) để phòng ngừa rò rỉ thông tin.", ["Công khai danh sách khách hàng lên trang web để minh bạch", "Áp dụng biện pháp quản lý và kỹ thuật bảo mật để chống xâm nhập, rò rỉ dữ liệu", "Xóa toàn bộ dữ liệu của khách hàng ngay sau mỗi ngày làm việc", "Không cho phép nhân viên sử dụng máy tính làm việc"], 1),
      ];

    case "wifi-cong-cong-an-toan":
      return [
        quiz("Nguy cơ an ninh lớn nhất khi bạn kết nối vào một mạng Wifi công cộng không yêu cầu mật khẩu là gì?", "Kẻ xấu có thể chặn bắt toàn bộ lưu lượng dữ liệu truyền qua mạng đó để lấy mật khẩu, thông tin tài khoản của bạn.", ["Điện thoại của bạn sẽ bị khóa màn hình", "Dữ liệu truyền đi có thể bị kẻ xấu đánh chặn và đọc lén", "Mạng Wifi công cộng sẽ làm hỏng phần cứng điện thoại", "Dung lượng pin của máy sẽ bị cạn kiệt ngay lập tức"], 1),
        quiz("Kiểu tấn công 'Man-in-the-Middle' (Người đứng giữa) trên mạng Wifi công cộng hoạt động thế nào?", "Kẻ tấn công xen vào giữa luồng truyền tải dữ liệu từ thiết bị của bạn đến điểm truy cập để xem và chỉnh sửa thông tin giao dịch.", ["Kẻ xấu giật điện thoại của bạn từ phía sau", "Kẻ tấn công đánh chặn luồng dữ liệu truyền tải giữa thiết bị của bạn và điểm phát Wifi", "Điện thoại tự động tắt nguồn khi đang kết nối mạng", "Tự động gửi email rác đến danh sách bạn bè"], 1),
        quiz("Công cụ bảo mật nào giúp mã hóa toàn bộ dữ liệu internet truyền đi từ thiết bị của bạn khi dùng Wifi công cộng?", "Sử dụng mạng ảo riêng (VPN - Virtual Private Network) giúp tạo đường truyền mã hóa an toàn.", ["Trình duyệt ẩn danh (Incognito)", "Mạng ảo riêng (VPN)", "Phần mềm dọn rác điện thoại", "Ứng dụng quét mã QR"], 1),
        quiz("Loại giao dịch nào dưới đây được khuyến cáo tuyệt đối KHÔNG nên thực hiện khi kết nối Wifi công cộng?", "Các giao dịch chuyển tiền ngân hàng trực tiếp, đăng nhập tài khoản chứng khoán hoặc mua sắm nhập số thẻ tín dụng.", ["Xem video giải trí trên Youtube", "Giao dịch ngân hàng trực tuyến và nhập thông tin thẻ tín dụng", "Đọc báo tin tức hàng ngày", "Tra cứu bản đồ định vị đường đi"], 1),
        quiz("Tại sao kẻ xấu thường tạo ra các điểm phát Wifi miễn phí có tên tương tự như tên của sân bay, nhà hàng (ví dụ: 'Wifi San Bay Mien Phi')?", "Để dụ người dùng tin tưởng kết nối vào mạng Wifi do chúng thiết lập, từ đó đánh cắp dữ liệu đăng nhập của nạn nhân.", ["Để hỗ trợ hành khách kết nối mạng nhanh hơn", "Để đánh lừa người dùng kết nối vào mạng do chúng kiểm soát nhằm đánh cắp dữ liệu", "Để quảng cáo cho dịch vụ của sân bay", "Vì nhà mạng viễn thông yêu cầu làm như vậy"], 1),
        quiz("Tính năng tự động kết nối Wifi (Auto-connect) trên điện thoại thông minh mang lại rủi ro bảo mật gì?", "Điện thoại có thể tự động kết nối vào các điểm phát Wifi giả mạo độc hại trùng tên đã lưu mà bạn không hề hay biết.", ["Làm điện thoại chạy nhanh hơn", "Điện thoại tự động kết nối vào các mạng Wifi giả mạo độc hại trùng tên cũ", "Làm hỏng bộ thu phát sóng Wifi của điện thoại", "Làm mất dữ liệu danh bạ điện thoại"], 1),
        quiz("Khi truy cập trang web bằng mạng Wifi công cộng, dấu hiệu nào trên thanh địa chỉ cho thấy kết nối được bảo mật mã hóa?", "Địa chỉ trang web bắt đầu bằng giao thức 'https://' và có biểu tượng hình chiếc khóa nhỏ.", ["Có chữ 'www' ở đầu địa chỉ", "Có giao thức 'https://' và biểu tượng hình chiếc khóa bảo mật", "Trang web có nhiều hình ảnh đẹp", "Trang web load nhanh dưới 3 giây"], 1),
        quiz("Khi kết nối vào mạng Wifi công cộng tại quán cà phê, bạn nên thiết lập cài đặt chia sẻ tệp tin thế nào?", "Tắt toàn bộ tính năng chia sẻ tệp tin và máy in (File and Printer Sharing) trên máy tính để tránh bị xâm nhập từ xa.", ["Bật tính năng chia sẻ thư mục công việc cho mọi người", "Tắt toàn bộ tính năng chia sẻ tệp tin và máy in (File and Printer Sharing)", "Bật tính năng kết nối máy in dùng chung", "Không cần thay đổi thiết lập mặc định"], 1),
        quiz("Sử dụng mạng dữ liệu di động 3G/4G/5G so với việc dùng Wifi công cộng không mật khẩu có ưu thế gì về bảo mật?", "An toàn hơn rất nhiều vì dữ liệu truyền đi được mã hóa bảo mật từ thiết bị đến trạm phát sóng của nhà mạng viễn thông.", ["Tốc độ luôn chậm hơn Wifi công cộng", "An toàn bảo mật hơn rất nhiều do đường truyền dữ liệu được mã hóa bởi nhà mạng viễn thông", "Không tốn chi phí sử dụng", "Làm điện thoại mát hơn khi dùng lâu"], 1),
        quiz("Sau khi ngắt kết nối với mạng Wifi công cộng, hành động nào giúp bảo vệ thiết bị của bạn không tự kết nối lại sau này?", "Bấm chọn tên mạng Wifi đó và chọn lệnh 'Quên mạng này' (Forget Network) trên thiết bị.", ["Tắt nguồn điện thoại và bật lại", "Chọn lệnh 'Quên mạng này' (Forget Network) trên thiết bị", "Xóa lịch sử duyệt web của trình duyệt", "Đổi tên thiết bị điện thoại"], 1),
      ];

    case "quyen-rieng-tu-chia-se-anh":
      return [
        quiz("Hành vi nào bị nghiêm cấm theo quy định của Luật Trẻ em trên môi trường mạng internet?", "Nghiêm cấm công bố, tiết lộ thông tin về đời sống riêng tư, bí mật cá nhân của trẻ em mà không được sự đồng ý của cha mẹ và bản thân trẻ.", ["Đăng ảnh trẻ em tham gia hoạt động văn nghệ trường học", "Công bố thông tin đời sống riêng tư, bí mật cá nhân của trẻ em khi chưa được sự đồng ý của cha mẹ và trẻ từ đủ 7 tuổi", "Đăng tải các bài học pháp luật dành cho trẻ em", "Chia sẻ hình ảnh trẻ em được nhận học bổng xuất sắc"], 1),
        quiz("Khi đăng hình ảnh đời tư hoặc kết quả học tập của trẻ em từ đủ 7 tuổi lên mạng, bắt buộc phải có sự đồng ý của ai?", "Phải được sự đồng ý của cha mẹ, người giám hộ hợp pháp và sự đồng ý của bản thân trẻ em từ đủ 07 tuổi trở lên.", ["Chỉ cần giáo viên chủ nhiệm đồng ý", "Phải được sự đồng ý của cha mẹ/người giám hộ và của chính trẻ em đó", "Chỉ cần người đăng ảnh đồng ý", "Không cần sự đồng ý của ai nếu là ảnh đẹp"], 1),
        quiz("Rủi ro tiềm ẩn lớn nhất khi cha mẹ thường xuyên đăng ảnh con cái công khai lên mạng xã hội kèm tên trường, lớp học là gì?", "Kẻ xấu có thể định vị vị trí của trẻ để thực hiện hành vi tiếp cận, bắt cóc, lừa đảo hoặc bắt nạt trực tuyến.", ["Khiến trang cá nhân của cha mẹ bị giảm tương tác", "Tạo điều kiện cho kẻ xấu theo dõi, định vị để thực hiện hành vi xâm hại hoặc bắt cóc trẻ", "Làm điện thoại của cha mẹ bị đầy bộ nhớ", "Làm ảnh hưởng đến tốc độ mạng của gia đình"], 1),
        quiz("Theo Bộ luật Dân sự, việc sử dụng hình ảnh của một cá nhân ngoài đời thực bắt buộc phải đáp ứng điều kiện gì?", "Việc sử dụng hình ảnh của cá nhân phải được sự đồng ý của người đó hoặc người đại diện hợp pháp của họ.", ["Được phép sử dụng tự do nếu không viết tên họ của họ", "Phải được sự đồng ý của cá nhân đó hoặc người đại diện hợp pháp của họ", "Được phép sử dụng nếu bức ảnh chụp ở nơi công cộng", "Được phép sử dụng nếu bức ảnh chụp bằng điện thoại cá nhân"], 1),
        quiz("Hành vi tự ý đăng hình ảnh chụp trộm người khác lên mạng xã hội kèm lời lẽ bôi nhọ, chế giễu ngoại hình vi phạm quyền gì?", "Vi phạm quyền của cá nhân đối với hình ảnh và quyền được bảo vệ danh dự, nhân phẩm, uy tín của cá nhân.", ["Vi phạm quyền tự do ngôn luận của bản thân người đăng", "Xâm phạm quyền đối với hình ảnh và quyền được bảo vệ danh dự, nhân phẩm của cá nhân đó", "Không vi phạm vì mạng xã hội là môi trường ảo tự do", "Chỉ vi phạm quy chế của trường học"], 1),
        quiz("Khi phát hiện hình ảnh cá nhân của mình bị một shop online tự ý lấy sử dụng quảng cáo sản phẩm tăng cân, bạn có quyền gì?", "Yêu cầu gỡ bỏ hình ảnh, bồi thường thiệt hại thực tế phát sinh hoặc khởi kiện ra Tòa án nhân dân.", ["Chỉ được quyền bình luận nhắc nhở dưới bài đăng", "Yêu cầu gỡ bỏ hình ảnh, bồi thường thiệt hại hoặc khởi kiện bảo vệ quyền lợi", "Tự ý hack sập fanpage của shop đó để trả đũa", "Không có quyền can thiệp nếu shop đã mua ảnh từ bên thứ ba"], 1),
        quiz("Hành vi chụp ảnh, quay phim người khác tại các khu vực riêng tư (như nhà vệ sinh, phòng thay đồ) rồi phát tán bị xử lý thế nào?", "Bị xử phạt hành chính mức nặng hoặc truy cứu trách nhiệm hình sự về tội làm nhục người khác hoặc truyền bá văn hóa phẩm đồi trụy.", ["Chỉ bị phạt cảnh cáo nội bộ", "Bị xử phạt hành chính nặng hoặc truy cứu trách nhiệm hình sự tùy mức độ hành vi", "Không bị xử lý nếu chỉ gửi trong nhóm chat kín", "Chỉ bị tịch thu điện thoại"], 1),
        quiz("Tự ý đăng hình ảnh con cái của đồng nghiệp lên mạng xã hội mà chưa hỏi ý kiến của đồng nghiệp đó có đúng luật không?", "Không đúng luật, việc sử dụng hình ảnh trẻ em phải được sự đồng ý của cha mẹ hoặc người giám hộ hợp pháp.", ["Đúng luật vì thể hiện sự yêu quý trẻ nhỏ", "Không đúng luật vì chưa có sự đồng ý của cha mẹ/người giám hộ hợp pháp của trẻ", "Đúng luật nếu ảnh chụp chung với con của mình", "Tùy thuộc vào việc bức ảnh có được gắn thẻ (tag) hay không"], 1),
        quiz("Thiết lập chế độ riêng tư nào khi đăng ảnh gia đình, con cái trên mạng xã hội là an toàn nhất?", "Nên thiết lập chế độ hiển thị 'Bạn bè' (Friends) hoặc nhóm gia đình riêng tư, tránh đặt chế độ 'Công khai' (Public).", ["Chế độ Công khai (Public) để mọi người cùng xem", "Chế độ Bạn bè (Friends) hoặc nhóm riêng tư hạn chế người lạ", "Chế độ Chỉ mình tôi (Only me) để lưu trữ", "Chế độ chia sẻ cho tất cả mọi người trong khu vực"], 1),
        quiz("Tại sao việc tắt định vị GPS khi chụp ảnh trước khi đăng tải lên mạng xã hội lại giúp bảo vệ quyền riêng tư?", "Vì tệp ảnh chụp thường lưu siêu dữ liệu (EXIF) chứa tọa độ GPS chính xác vị trí nhà riêng hoặc trường học của bạn.", ["Làm bức ảnh hiển thị sắc nét hơn", "Tránh để lộ tọa độ GPS chính xác của vị trí nhà riêng, cơ quan thông qua siêu dữ liệu ảnh", "Lúp tiết kiệm dung lượng bộ nhớ khi lưu trữ ảnh", "Giúp bức ảnh không bị dính bản quyền thương hiệu"], 1),
      ];

    case "lua-dao-tuyen-dung-viec-nhe":
      return [
        quiz("Kịch bản lừa đảo 'Tuyển cộng tác viên xử lý đơn hàng online' thường diễn ra thế nào?", "Kẻ xấu gửi tin nhắn hứa hẹn công việc nhẹ nhàng làm tại nhà, nhận hoa hồng 10% - 20% mỗi đơn hàng sau khi chuyển khoản thanh toán.", ["Gửi hồ sơ ứng tuyển trực tiếp tại văn phòng đại diện", "Hứa hẹn công việc làm tại nhà, yêu cầu ứng viên tự chuyển tiền thanh toán đơn hàng trước để nhận hoa hồng", "Đào tạo nghiệp vụ miễn phí trong 3 tháng có lương cơ bản", "Yêu cầu phỏng vấn trực tiếp bằng tiếng Anh"], 1),
        quiz("Tại sao ở những nhiệm vụ đầu tiên giá trị nhỏ, kẻ lừa đảo vẫn chuyển trả tiền gốc và hoa hồng đầy đủ cho nạn nhân?", "Để tạo dựng niềm tin và kích thích lòng tham, dẫn dụ nạn nhân thực hiện các nhiệm vụ sau với số tiền lớn hơn gấp nhiều lần.", ["Vì họ hoạt động kinh doanh uy tín", "Để tạo lòng tin, dẫn dụ nạn nhân nạp thêm số tiền lớn hơn ở các nhiệm vụ tiếp theo", "Vì hệ thống chuyển tiền tự động bị lỗi", "Vì họ muốn tặng tiền trải nghiệm cho người lao động"], 1),
        quiz("Khi số tiền nạp làm nhiệm vụ của nạn nhân lên tới hàng chục triệu, kẻ lừa đảo thường dùng cớ gì để giam tiền không cho rút?", "Bịa lý do lỗi hệ thống, nhập sai cú pháp, tài khoản bị khóa và yêu cầu nạp thêm tiền thuế/phí để giải ngân toàn bộ.", ["Yêu cầu nạp thêm tiền để sửa lỗi hệ thống, đóng thuế hoặc nâng cấp tài khoản mới được rút", "Đồng ý chuyển khoản trả ngay lập tức", "Gửi hợp đồng lao động chính thức cho nạn nhân ký", "Báo công an bắt giữ nạn nhân vì tội rửa tiền"], 0),
        quiz("Các lời mời công việc như 'Thả tim TikTok, đánh giá địa điểm Google Map nhận tiền' thực chất là gì?", "Là chiêu trò dẫn dụ nạn nhân tham gia vào các nhóm kín Telegram để thực hiện bẫy lừa đảo nạp tiền nhiệm vụ đơn hàng.", ["Công việc tiếp thị liên kết chính thống của TikTok", "Chiêu trò dẫn dụ ứng viên vào nhóm kín để thực hiện hành vi lừa đảo nạp tiền làm nhiệm vụ", "Dự án khảo sát thị trường của Google Việt Nam", "Hoạt động quảng cáo hợp pháp của các nhãn hàng"], 1),
        quiz("Dấu hiệu nhận diện rõ ràng nhất của một thông tin tuyển dụng lừa đảo qua mạng xã hội là gì?", "Hứa hẹn 'việc nhẹ lương cao', không cần kinh nghiệm, làm tại nhà nhận lương triệu đồng mỗi ngày và yêu cầu đóng phí trước.", ["Yêu cầu hồ sơ ứng viên rõ ràng, có phỏng vấn trực tiếp", "Hứa hẹn việc nhẹ lương cao, không cần trình độ và yêu cầu nạp tiền hệ thống trước", "Mức lương ghi rõ theo thỏa thuận năng lực thực tế", "Công ty có thông tin địa chỉ mã số thuế rõ ràng"], 1),
        quiz("Nhà tuyển dụng uy tín và hợp pháp có quyền yêu cầu ứng viên đóng tiền cọc hoặc mua tài liệu hướng dẫn trước khi làm việc không?", "Không, luật lao động nghiêm cấm hành vi thu tiền của người lao động dưới mọi hình thức trước khi ký hợp đồng và nhận việc.", ["Được phép thu nếu có ghi trong quy định của công ty", "Tuyệt đối không được thu tiền của người lao động trước khi nhận việc", "Được phép thu phí làm hồ sơ dưới 500.000đ", "Chỉ được thu khi ứng viên đồng ý tự nguyện"], 1),
        quiz("Nếu bạn đã lỡ chuyển tiền làm nhiệm vụ CTV đơn hàng và bị giam tiền, hành động nào là đúng đắn nhất?", "Dừng chuyển tiền ngay lập tức, thu thập biên lai chuyển khoản, đoạn chat để trình báo cơ quan Công an.", ["Tiếp tục mượn tiền nạp thêm để lấy lại số tiền cũ", "Dừng chuyển tiền ngay lập tức, thu thập bằng chứng chat, biên lai và trình báo công an", "Nhờ người quen hack hệ thống của họ để lấy lại tiền", "Chấp nhận mất tiền và tự xóa hết tin nhắn trò chuyện"], 1),
        quiz("Để kiểm tra xem một công ty đang tuyển dụng trực tuyến có hoạt động hợp pháp hay không, bạn nên tra cứu thông tin ở đâu?", "Tra cứu thông tin đăng ký doanh nghiệp, mã số thuế và tình trạng hoạt động trên Cổng thông tin quốc gia về đăng ký doanh nghiệp.", ["Hỏi ý kiến của các thành viên trong nhóm tuyển dụng đó", "Tra cứu mã số thuế, địa chỉ trên Cổng thông tin quốc gia về đăng ký doanh nghiệp", "Xem số lượng lượt theo dõi trên trang cá nhân của người tuyển dụng", "Bấm thử vào các liên kết quảng cáo trên Google"], 1),
        quiz("Hành vi lừa đảo tuyển dụng qua mạng chiếm đoạt tài sản của người dân từ 2 triệu đồng trở lên bị xử lý hình sự thế nào?", "Bị khởi tố hình sự về Tội lừa đảo chiếm đoạt tài sản theo quy định tại Điều 174 Bộ luật Hình sự.", ["Chỉ bị phạt tiền hành chính cảnh cáo", "Bị khởi tố hình sự về Tội lừa đảo chiếm đoạt tài sản", "Bị phạt lao động cải tạo không giam giữ tại công ty", "Không bị xử lý nếu trả lại tiền cho nạn nhân"], 1),
        quiz("Tổng đài tiếp nhận phản ánh về các cuộc gọi, tin nhắn rác tuyển dụng lừa đảo của cơ quan quản lý là số nào?", "Người dân có thể gửi phản ánh tin nhắn rác, cuộc gọi lừa đảo đến đầu số tổng đài 156 hoặc 5656.", ["Số 113", "Số 114", "Số 156", "Số 115"], 2),
      ];

    case "lua-dao-tinh-cam-dau-tu":
      return [
        quiz("Thủ đoạn lừa đảo tình cảm rồi dụ đầu tư tài chính trực tuyến (Romance Scam) thường bắt đầu thế nào?", "Kẻ xấu tạo tài khoản hẹn hò ảo bắt mắt, nhắn tin tạo mối quan hệ yêu đương lãng mạn tạo lòng tin trước khi dụ nạp tiền đầu tư.", ["Gửi mail đe dọa tống tiền trực tiếp", "Kết bạn làm quen yêu đương qua ứng dụng hẹn hò, tạo lòng tin rồi dụ dỗ nạp tiền đầu tư sàn ảo", "Gửi tin nhắn thông báo trúng thưởng xe máy", "Gọi điện tự xưng cán bộ viện kiểm sát bắt giam"], 1),
        quiz("Kẻ lừa đảo xây dựng niềm tin với nạn nhân qua ứng dụng hẹn hò bằng cách nào?", "Sử dụng ảnh của hotboy, hotgirl nổi tiếng, quan tâm chu đáo mỗi ngày, hứa hẹn tương lai kết hôn giàu sang.", ["Yêu cầu gặp mặt trực tiếp tại quán cà phê sang trọng ngay ngày đầu tiên", "Sử dụng hình ảnh giả mạo, nhắn tin ngọt ngào liên tục và hứa hẹn kết hôn mua nhà", "Gửi bản sao CCCD chính chủ cho nạn nhân kiểm tra", "Chuyển tiền tặng quà giá trị lớn cho nạn nhân trước"], 1),
        quiz("Sau khi thiết lập quan hệ yêu đương ảo, kẻ lừa đảo thường dụ dỗ nạn nhân tham gia hoạt động nào?", "Giới thiệu mình có người nhà làm kỹ thuật sàn đầu tư, biết trước kết quả, chắc chắn sinh lãi cao và rủ nạn nhân cùng nạp tiền chơi chung.", ["Rủ đi du lịch nước ngoài cùng nhau", "Dụ dỗ tham gia nạp tiền vào sàn chứng khoán quốc tế hoặc tiền ảo giả mạo", "Yêu cầu đăng ký thẻ thành viên siêu thị hộ", "Mời tham gia các khóa học kỹ năng mềm trực tuyến"], 1),
        quiz("Khi nạn nhân chuyển tiền nạp vào sàn đầu tư do 'người yêu ảo' giới thiệu, tiền thực chất sẽ đi đâu?", "Chuyển thẳng vào tài khoản ngân hàng cá nhân của kẻ lừa đảo dưới danh nghĩa tài khoản đại lý hoặc sàn nạp tiền.", ["Chuyển vào tài khoản tạm giữ của ngân hàng nhà nước", "Đi thẳng vào tài khoản ngân hàng cá nhân của kẻ lừa đảo hoặc đồng bọn", "Được quy đổi thành cổ phiếu chính thống của doanh nghiệp", "Được chuyển vào quỹ từ thiện quốc tế"], 1),
        quiz("Tại sao kẻ lừa đảo tình ái trực tuyến luôn tìm cách từ chối cuộc gọi video nhìn mặt hoặc gặp gỡ trực tiếp?", "Vì chúng sử dụng hình ảnh và thông tin của người khác, nếu gọi video hoặc gặp mặt sẽ bị lộ danh tính giả mạo ngay lập tức.", ["Vì tính cách của chúng rất rụt rè ngoài đời", "Vì chúng sử dụng danh tính giả mạo và sợ bị phát hiện khuôn mặt thật", "Vì điện thoại của chúng không hỗ trợ camera", "Vì quy định bảo mật thông tin của sàn đầu tư"], 1),
        quiz("Dấu hiệu nghi ngờ lớn nhất đối với một người bạn quen qua mạng xã hội chưa từng gặp mặt ngoài đời là gì?", "Họ chủ động bàn bạc về tiền bạc, rủ rê đầu tư tài chính chắc chắn sinh lãi hoặc mượn tiền giải quyết việc khẩn cấp.", ["Họ nhắn tin hỏi thăm về sở thích đọc sách của bạn", "Họ chủ động nói về đầu tư tiền bạc, sàn tài chính hoặc hỏi mượn tiền gấp", "Họ gửi ảnh phong cảnh quê hương của họ cho bạn xem", "Họ trả lời tin nhắn của bạn sau 2 tiếng"], 1),
        quiz("Khi bạn muốn rút tiền từ sàn đầu tư do người yêu ảo giới thiệu và sàn báo lỗi, yêu cầu nạp thêm 20% phí rút tiền, bạn nên làm gì?", "Tuyệt đối không nạp thêm vì đây chắc chắn là sàn lừa đảo, số tiền nạp thêm sẽ tiếp tục bị chúng chiếm đoạt.", ["Nạp thêm ngay để kịp giải ngân số tiền cũ", "Tuyệt đối không nạp thêm tiền vì đây là thủ đoạn giam tiền lừa đảo liên hoàn", "Nhờ người yêu ảo nạp hộ toàn bộ số tiền đó", "Chia sẻ tài khoản đăng nhập cho bạn bè nhờ rút hộ"], 1),
        quiz("Công cụ nào dưới đây giúp bạn kiểm tra xem hình ảnh của đối phương trên app hẹn hò có phải là ảnh giả mạo đi sao chép không?", "Sử dụng tính năng tìm kiếm hình ảnh ngược (Google Image Search) để quét xem ảnh có trùng khớp với tài khoản người nổi tiếng nào không.", ["Sử dụng ứng dụng máy tính bỏ túi", "Sử dụng tính năng tìm kiếm bằng hình ảnh ngược (Google Search Image)", "Xem số lượng danh sách bạn bè của họ", "Bấm nút báo cáo tài khoản trên ứng dụng"], 1),
        quiz("Chia sẻ thông tin cá nhân và tài chính nhạy cảm cho người quen qua mạng mang lại rủi ro gì?", "Kẻ xấu có thể dùng thông tin đó để tống tiền, đe dọa hoặc bán dữ liệu của bạn cho các băng nhóm lừa đảo khác.", ["Giúp đối phương hiểu rõ tính cách của bạn hơn", "Bị lợi dụng thông tin để tống tiền, đe dọa hoặc làm mục tiêu lừa đảo tiếp theo", "Điện thoại của bạn sẽ tự động bị khóa nguồn", "Không mang lại rủi ro nào nếu bạn đã xóa tin nhắn sau khi gửi"], 1),
        quiz("Khi nhận ra mình đã bị lừa chuyển tiền vào sàn đầu tư giả mạo dưới bẫy tình ái, hành động cần làm ngay là gì?", "Ngắt liên lạc với kẻ lừa đảo, lưu lại toàn bộ biên lai chuyển tiền, tên sàn web, tài khoản ngân hàng và báo ngay cho công an.", ["Năn nỉ kẻ lừa đảo trả lại tiền cho mình", "Lưu lại toàn bộ biên lai chuyển khoản, lịch sử chat và trình báo cơ quan công an", "Xóa toàn bộ ứng dụng và coi như chưa có chuyện gì xảy ra", "Đăng bài bóc phốt lên trang cá nhân mà không cần bằng chứng"], 1),
      ];

    case "gia-danh-co-quan-chuc-nang":
      return [
        quiz("Cơ quan Công an, Viện kiểm sát hoặc Tòa án ở Việt Nam có bao giờ làm việc với người dân qua điện thoại hoặc mạng xã hội không?", "Tuyệt đối không, cơ quan pháp luật bắt buộc phải gửi giấy mời hoặc giấy triệu tập trực tiếp thông qua chính quyền địa phương.", ["Có, khi vụ án cần điều tra gấp bảo mật", "Tuyệt đối không làm việc qua điện thoại, mọi yêu cầu đều phải gửi giấy mời trực tiếp", "Chỉ làm việc qua Zalo đối với án dân sự", "Chỉ làm việc qua điện thoại khi người dân đồng ý"], 1),
        quiz("Kịch bản phổ biến nhất của các cuộc gọi giả danh cơ quan điều tra lừa đảo người dân là gì?", "Hăm dọa nạn nhân liên quan đến đường dây ma túy, rửa tiền quốc tế và thông báo có lệnh bắt giam khẩn cấp.", ["Thông báo người dân được nhận gói hỗ trợ an sinh xã hội", "Hăm dọa nạn nhân liên quan đến án hình sự, ma túy và yêu cầu chuyển tiền phối hợp điều tra", "Mới tham dự lễ kỷ niệm thành lập ngành công an", "Thông báo trúng thưởng chương trình tri ân khách hàng"], 1),
        quiz("Kẻ lừa đảo giả danh công an yêu cầu người dân chuyển tiền vào tài khoản ngân hàng nhằm mục đích gì?", "Yêu cầu chuyển tiền vào tài khoản tạm giữ của cơ quan điều tra để kiểm tra chứng minh sự trong sạch rồi sẽ trả lại.", ["Để thanh toán tiền lệ phí làm hồ sơ vụ án", "Yêu cầu chuyển tiền vào 'tài khoản an toàn' để giám định chứng minh trong sạch rồi chiếm đoạt", "Để nộp tiền phạt hành chính trực tuyến", "Để mua cổ phiếu hỗ trợ cơ quan điều tra"], 1),
        quiz("Cơ quan công an có sử dụng tài khoản ngân hàng cá nhân mang tên riêng của cán bộ điều tra để giữ tiền của người dân không?", "Tuyệt đối không, cơ quan điều tra không thu giữ tiền của công dân qua tài khoản cá nhân, mọi việc tạm giữ tài sản phải lập biên bản quyết định hành chính.", ["Có sử dụng đối với các chuyên án mật", "Tuyệt đối không bao giờ yêu cầu chuyển tiền vào tài khoản cá nhân để điều tra", "Có sử dụng nếu có quyết định của Thủ trưởng cơ quan điều tra", "Chỉ sử dụng khi người dân không có tài khoản doanh nghiệp"], 1),
        quiz("Tại sao kẻ lừa đảo giả danh yêu cầu nạn nhân phải vào phòng kín đóng cửa và giữ bí mật tuyệt đối cuộc gọi với người nhà?", "Để cô lập tâm lý nạn nhân, gây hoảng sợ và không cho người nhà kịp thời phát hiện can ngăn khuyên nhủ.", ["Để bảo mật tuyệt đối bí mật quốc gia theo luật định", "Để cô lập nạn nhân, gây áp lực tâm lý và ngăn chặn sự can thiệp từ người thân", "Để tín hiệu sóng điện thoại được truyền tải rõ ràng nhất", "Vì cơ quan công an yêu cầu ghi âm cuộc họp không có tạp âm"], 1),
        quiz("Khi nhận được cuộc gọi tự xưng là cán bộ công an thông báo có lệnh bắt giam và yêu cầu chuyển tiền, việc nên làm là gì?", "Giữ bình tĩnh, từ chối chuyển tiền, cúp máy ngay lập tức và liên hệ với cơ quan công an gần nhất để xác minh.", ["Chuyển khoản ngay để tránh bị bắt giam oan", "Giữ bình tĩnh, cúp máy ngay và báo cho người thân hoặc công an xã/phường nơi cư trú", "Cung cấp mật khẩu tài khoản ngân hàng để họ tự kiểm tra", "Mắng mỏ và đe dọa lại người gọi điện"], 1),
        quiz("Kẻ xấu gửi hình ảnh 'Lệnh bắt tạm giam', 'Lệnh phong tỏa tài sản' có dấu đỏ của Viện kiểm sát qua Zalo có giá trị pháp lý không?", "Không, các văn bản tố tụng hình sự bắt buộc phải được giao nhận trực tiếp tại nơi cư trú, có sự tham gia của đại diện chính quyền cấp xã.", ["Có giá trị pháp lý tương đương văn bản giấy", "Tuyệt đối không có giá trị pháp lý, đây là tài liệu giả mạo do kẻ xấu tự in ấn chỉnh sửa", "Chỉ có giá trị khi gửi kèm số hiệu cán bộ điều tra", "Chỉ có giá trị pháp lý vào giờ hành chính"], 1),
        quiz("Hành vi giả danh cán bộ công an, viện kiểm sát để lừa tiền người dân bị xử lý hình sự theo tội danh nào?", "Khởi tố hình sự về Tội lừa đảo chiếm đoạt tài sản (Điều 174) và Tội giả dạng cấp bậc, chức vụ (Điều 338) Bộ luật Hình sự.", ["Tội đe dọa giết người", "Tội lừa đảo chiếm đoạt tài sản và tội giả dạng cấp bậc, chức vụ", "Tội cản trở hoạt động tư pháp", "Không bị xử lý hình sự nếu trả lại tiền đã chiếm đoạt"], 1),
        quiz("Đầu số điện thoại hiển thị dấu cộng (+) ở đầu (ví dụ: +8455..., +008...) gọi đến tự xưng cơ quan chức năng có đặc điểm gì?", "Đây là cuộc gọi giả mạo số điện thoại thông qua công nghệ VoIP truyền qua mạng Internet để che giấu số thực và quốc gia gửi.", ["Là số điện thoại đường dây nóng của Bộ Công an", "Là cuộc gọi giả mạo qua Internet (VoIP) để ẩn danh số thực của kẻ lừa đảo", "Là số điện thoại chính thức của cơ quan cảnh sát quốc tế", "Là số điện thoại của nhà mạng viễn thông hỗ trợ khẩn cấp"], 1),
        quiz("Nếu phát hiện hoặc nghi ngờ cuộc gọi giả danh lừa đảo, người dân nên báo cáo thông tin đến đầu số nào của Bộ Thông tin và Truyền thông?", "Đầu số tổng đài 156 (hoặc 5656) là kênh tiếp nhận phản ánh tin nhắn rác, cuộc gọi rác và cuộc gọi có dấu hiệu lừa đảo.", ["Số điện thoại 113", "Số điện thoại 115", "Số điện thoại 156 (hoặc 5656)", "Số điện thoại 1080"], 2),
      ];

    case "lua-dao-hack-muon-tien":
      return [
        quiz("Kẻ lừa đảo thường thực hiện hành động nào đầu tiên sau khi hack được tài khoản Facebook/Zalo của một người?", "Đọc lịch sử tin nhắn cũ để tìm hiểu mối quan hệ thân thiết và cách xưng hô của chủ tài khoản với người thân bè bạn.", ["Xóa toàn bộ danh sách bạn bè", "Đọc tin nhắn cũ để tìm hiểu cách xưng hô và các mối quan hệ thân thiết để lên kịch bản mượn tiền", "Đăng tải các bức ảnh phong cảnh lên trang cá nhân", "Đổi tên tài khoản thành một tên tiếng Anh lạ"], 1),
        quiz("Khi nhận được tin nhắn hỏi mượn tiền từ tài khoản Facebook của người thân, hành động nào là bắt buộc trước khi chuyển khoản?", "Gọi điện thoại trực tiếp (bằng số điện thoại thường hoặc gọi video) để nghe giọng nói và nhìn mặt xác thực đúng người mượn.", ["Chuyển tiền ngay lập tức vì sợ người thân gặp chuyện gấp", "Gọi điện trực tiếp hoặc gọi video qua kênh khác để xác minh chính xác danh tính người mượn", "Hỏi mật khẩu Facebook của họ để kiểm tra", "Nhắn tin hỏi tên trường học cũ của họ để thử thách"], 1),
        quiz("Kẻ lừa đảo thường bịa ra lý do gì khi nạn nhân yêu cầu gọi cuộc gọi video (video call) để nhìn mặt?", "Báo mạng yếu chập chờn, camera bị hỏng, đang ở nơi ồn ào hoặc sử dụng công nghệ deepfake giả mặt vài giây rồi cúp máy.", ["Đồng ý gọi video nói chuyện thoải mái hàng giờ", "Bịa lý do mạng yếu, hỏng camera hoặc dùng công nghệ AI Deepfake giả dạng vài giây rồi tắt", "Yêu cầu nạn nhân phải gửi OTP trước mới gọi video được", "Báo công an bắt nạn nhân vì tội nghi ngờ người khác"], 1),
        quiz("Tại sao số tài khoản ngân hàng nhận tiền do kẻ lừa đảo cung cấp lại mang tên một người lạ chứ không phải tên người thân bạn?", "Vì kẻ lừa đảo sử dụng các tài khoản ngân hàng rác do chúng thuê, mua lại của người khác để nhận tiền nhằm che giấu vết tích.", ["Vì người thân của bạn đã đổi tên khai sinh", "Vì kẻ lừa đảo dùng tài khoản ngân hàng rác đi mua/thuê của người khác để nhận tiền trốn tránh truy vết", "Vì ngân hàng tự động chuyển tên người nhận để bảo mật", "Vì người thân của bạn đăng ký tài khoản doanh nghiệp"], 1),
        quiz("Biện pháp kỹ thuật nào giúp tài khoản mạng xã hội của bạn phòng tránh hiệu quả việc bị hack chiếm quyền điều khiển?", "Kích hoạt bảo mật xác thực hai lớp (2FA), liên kết số điện thoại chính chủ và không bấm vào đường link lạ.", ["Chỉ sử dụng mạng xã hội vào ban ngày", "Kích hoạt bảo mật xác thực 2 lớp (2FA) và không click vào link lạ", "Đặt ảnh đại diện trùng với ảnh CCCD", "Thường xuyên xóa danh sách bạn bè ít tương tác"], 1),
        quiz("Khi biết tài khoản Facebook của mình bị hack và đang đi nhắn tin mượn tiền bạn bè, bạn cần làm gì ngay lập tức?", "Sử dụng các kênh liên lạc khác (gọi điện, đăng tin cảnh báo) thông báo cho người thân, bạn bè biết tài khoản đã bị chiếm quyền.", ["Đợi hacker trả lại tài khoản cho mình", "Gọi điện hoặc đăng tin cảnh báo ngay cho người thân bè bạn tránh bị lừa chuyển tiền", "Tự chuyển khoản một số tiền nhỏ vào tài khoản của mình để khóa hệ thống", "Không cần làm gì vì hacker sẽ tự chán và trả lại tài khoản"], 1),
        quiz("Hành vi mở tài khoản ngân hàng rồi cho thuê, cho mượn hoặc bán lại cho người khác sử dụng bị xử lý thế nào?", "Bị xử phạt vi phạm hành chính nặng hoặc có thể bị truy cứu trách nhiệm hình sự về tội đồng khỏa tiếp tay cho tội phạm lừa đảo.", ["Được coi là hành vi kiếm tiền hợp pháp bình thường", "Bị xử phạt hành chính nặng hoặc truy cứu trách nhiệm hình sự nếu tiếp tay cho lừa đảo", "Chỉ bị ngân hàng khóa thẻ vĩnh viễn không bị phạt tiền", "Được ngân hàng tuyên dương vì tăng chỉ số mở thẻ"], 1),
        quiz("If lỡ chuyển khoản tiền cho kẻ lừa đảo hack facebook mượn tiền, việc khẩn cấp đầu tiên nên làm là gì?", "Liên hệ ngay đường dây nóng của ngân hàng báo cáo giao dịch lừa đảo để phong tỏa tài khoản nhận tiền và làm đơn báo công an.", ["Chờ đợi người thân trả tiền lại cho mình", "Liên hệ hotline ngân hàng báo cáo lừa đảo để khóa tài khoản đích và trình báo công an", "Nhắn tin chửi bới tài khoản hacker để đòi tiền", "Đăng tin lên các nhóm facebook nhờ tìm hộ thông tin chủ tài khoản"], 1),
        quiz("Công nghệ 'Deepfake' được tội phạm công nghệ cao sử dụng trong các cuộc gọi lừa đảo nhằm mục đích gì?", "Sử dụng trí tuệ nhân tạo (AI) để giả lập khuôn mặt và giọng nói của người thân nạn nhân trong cuộc gọi video ngắn nhằm tạo lòng tin.", ["Để tăng tốc độ truyền tải cuộc gọi qua internet", "Giả lập khuôn mặt và giọng nói của người thân nạn nhân để đánh lừa trong cuộc gọi video", "Để tự động chuyển hướng cuộc gọi đến đồn công an", "Để diệt virus trên thiết bị điện thoại của nạn nhân"], 1),
        quiz("Tại sao kẻ lừa đảo thường chọn thời điểm nhắn tin mượn tiền vào lúc đêm muộn hoặc sáng sớm?", "Khi đó nạn nhân đang buồn ngủ, thiếu tỉnh táo, khó gọi điện xác minh trực tiếp và tâm lý vội vã muốn giúp người thân gấp.", ["Vì lúc đó hệ thống ngân hàng chuyển tiền nhanh hơn", "Tận dụng lúc nạn nhân thiếu tỉnh táo, khó liên lạc xác minh trực tiếp để thực hiện hành vi hối thúc chuyển tiền", "Vì lúc đó cơ quan công an không làm việc", "Vì tin tặc chỉ hoạt động vào ban đêm"], 1),
      ];

    case "nhan-qua-mien-phi-dong-coc":
      return [
        quiz("Chiêu trò lừa đảo 'Nhận quà tặng tri ân miễn phí' thường bắt đầu bằng hình thức liên lạc nào?", "Kẻ xấu nhắn tin, gọi điện thông báo bạn được trúng giải đặc biệt hoặc tặng quà giá trị cao hoàn toàn miễn phí từ thương hiệu lớn.", ["Gửi công văn chính thức của tòa án đến nhà riêng", "Nhắn tin, gọi điện thông báo trúng thưởng quà tặng giá trị cao hoàn toàn miễn phí", "Mời tham dự hội thảo khoa học quốc tế", "Gửi bưu phẩm có hóa đơn VAT thanh toán trước"], 1),
        quiz("Kẻ lừa đảo yêu cầu nạn nhân đóng khoản tiền nào trước khi nhận quà tặng miễn phí?", "Đóng phí vận chuyển (ship COD), phí hồ sơ trúng thưởng, thuế thu nhập cá nhân giải thưởng vào tài khoản cá nhân.", ["Phí bảo trì điện thoại di động của nạn nhân", "Phí vận chuyển, phí làm hồ sơ hoặc thuế trúng thưởng vào tài khoản cá nhân", "Tiền đóng góp quỹ vắc-xin của nhà nước", "Không yêu cầu đóng bất kỳ khoản tiền nào"], 1),
        quiz("Chương trình khuyến mại trúng thưởng hợp pháp có được phép thu tiền thuế TNCN của khách hàng qua tài khoản ngân hàng cá nhân không?", "Tuyệt đối không, thuế thu nhập cá nhân trúng thưởng được doanh nghiệp khấu trừ trực tiếp tại nguồn hoặc người dân tự nộp tại cơ quan thuế.", ["Được phép thu nếu có sự thỏa thuận trước", "Tuyệt đối không thu thuế trúng thưởng thông qua tài khoản ngân hàng cá nhân", "Chỉ được thu khi giải thưởng trị giá dưới 10 triệu đồng", "Được phép thu nếu do nhân viên CSKH đại diện nhận"], 1),
        quiz("Khi shipper giao bưu phẩm 'quà tặng tri ân miễn phí' yêu cầu thanh toán tiền thu hộ (COD) 300.000đ, bạn nên xử lý thế nào?", "Từ chối nhận gói hàng vì bên trong thường là sản phẩm giả, nhái giá trị rất thấp (dưới vài chục nghìn) nhằm mục đích lừa tiền COD.", ["Thanh toán tiền ngay để xem quà bên trong là gì", "Từ chối nhận bưu phẩm vì đây là chiêu trò lừa tiền COD bằng sản phẩm giá trị thấp", "Nhận hàng và nhờ shipper mở ra kiểm tra hộ trước khi trả tiền", "Trả tiền và gửi bưu phẩm tặng lại cho người khác"], 1),
        quiz("Tất cả các chương trình khuyến mại, quay số trúng thưởng có quy mô lớn của doanh nghiệp tại Việt Nam bắt buộc phải đăng ký với cơ quan nào?", "Bắt buộc phải đăng ký hoạt động và được phê duyệt bởi Bộ Công Thương hoặc Sở Công Thương các tỉnh, thành phố.", ["Bộ Công an", "Bộ Công Thương hoặc Sở Công Thương", "Bộ Thông tin và Truyền thông", "Ủy ban nhân dân cấp tỉnh"], 1),
        quiz("Dấu hiệu đáng ngờ nhất ở một thông báo trúng thưởng nhận quà là gì?", "Bạn không hề tham gia bất kỳ chương trình quay số hay mua sắm nào của thương hiệu đó nhưng vẫn được thông báo trúng giải lớn.", ["Sản phẩm trúng thưởng được giao bởi đơn vị vận chuyển uy tín", "Bạn không hề đăng ký tham gia chương trình nhưng vẫn được báo trúng giải đặc biệt", "Thông tin chương trình được đăng tải trên trang web chính thức của công ty", "Doanh nghiệp công khai danh sách người trúng giải"], 1),
        quiz("Kẻ lừa đảo gửi kèm ảnh chụp giấy chứng nhận trúng thưởng có đóng dấu đỏ của công ty qua tin nhắn nhằm mục đích gì?", "Để làm giả tính pháp lý, tạo niềm tin cho nạn nhân rằng đây là chương trình thật và an tâm chuyển tiền cọc.", ["Để gửi cho cơ quan thuế quyết toán", "Tạo lòng tin giả mạo để nạn nhân an tâm chuyển tiền phí theo yêu cầu", "Để làm thủ tục đăng ký quyền sở hữu trí tuệ", "Để gửi tặng người thân làm kỷ niệm"], 1),
        quiz("Nếu bạn đã lỡ chuyển tiền cọc làm hồ sơ trúng thưởng và kẻ xấu tiếp tục yêu cầu chuyển thêm tiền cọc bảo hiểm, bạn nên làm gì?", "Ngừng chuyển tiền ngay lập tức vì đây là dấu hiệu lừa đảo liên tiếp giam tiền của nạn nhân.", ["Tiếp tục chuyển tiền để hoàn thành nốt thủ tục nhận giải", "Ngừng chuyển tiền ngay lập tức vì tin tặc sẽ liên tục vẽ ra các loại phí để chiếm đoạt tiền", "Nhờ ngân hàng chuyển khoản tự động", "Gửi tin nhắn đe dọa đòi lại số tiền cũ"], 1),
        quiz("Nhận quà miễn phí trực tuyến nhưng yêu cầu cung cấp thông tin số thẻ tín dụng và mã CVV có rủi ro gì?", "Kẻ xấu sẽ sử dụng thông tin thẻ để thực hiện các giao dịch thanh toán trái phép trên mạng, chiếm đoạt toàn bộ tiền trong thẻ.", ["Làm thẻ tín dụng bị giảm hạn mức", "Bị kẻ xấu sử dụng thông tin thẻ thực hiện giao dịch thanh toán trái phép trên mạng", "Làm thẻ bị nhiễm virus máy tính", "Không có rủi ro nếu thẻ chưa kích hoạt"], 1),
        quiz("Bạn nên xử lý thế nào đối với các tin nhắn rác thông báo trúng thưởng gửi đến điện thoại cá nhân?", "Gửi phản ánh tin nhắn rác đến đầu số tổng đài 156/5656 của cơ quan quản lý và xóa tin nhắn, chặn số điện thoại gửi.", ["Chuyển tiếp tin nhắn cho nhiều người khác cùng biết", "Phản ánh tin nhắn rác đến tổng đài 156 và xóa tin nhắn, chặn người gửi", "Nhấp vào đường link đính kèm để xem hướng dẫn", "Gọi điện lại cho người gửi để cảm ơn họ"], 1),
      ];

    case "mua-nham-hang-gia-nhai":
      return [
        quiz("Khi phát hiện sản phẩm đã mua là hàng giả, hàng nhái nhãn hiệu, người tiêu dùng có quyền gì đầu tiên?", "Yêu cầu người bán đổi trả hàng, hoàn trả tiền mua hoặc bồi thường thiệt hại nếu có.", ["Yêu cầu người bán đổi trả hàng, hoàn tiền hoặc bồi thường thiệt hại", "Tự ý đập phá cửa hàng của bên bán", "Không được quyền yêu cầu gì vì mua rồi miễn đổi trả", "Bắt shipper bồi thường thiệt hại"], 0),
        quiz("Doanh nghiệp sản xuất, kinh doanh hàng giả bị xử lý thế nào trước pháp luật?", "Bị xử phạt hành chính nặng, tịch thu tang vật hoặc bị truy cứu trách nhiệm hình sự.", ["Chỉ bị nhắc nhở rút kinh nghiệm", "Bị xử phạt hành chính nặng, tịch thu tang vật hoặc bị truy cứu trách nhiệm hình sự", "Chỉ bị phạt tiền 500.000đ", "Được tiếp tục bán nếu ghi rõ là hàng giả"], 1),
        quiz("Tội sản xuất, buôn bán hàng giả theo Bộ luật Hình sự có thể bị phạt tù tối đa bao nhiêu năm?", "Có thể bị phạt tù đến 15 năm tù tùy theo quy mô và tính chất nghiêm trọng.", ["3 năm", "7 năm", "15 năm", "Tù chung thân"], 2),
        quiz("Cơ quan nào có thẩm quyền tiếp nhận và xử lý hành vi kinh doanh hàng giả, hàng nhái trên thị trường?", "Cơ quan Quản lý thị trường có nhiệm vụ kiểm tra và xử lý vi phạm thương mại.", ["Cơ quan Quản lý thị trường", "Ủy ban Mặt trận Tổ quốc", "Sở Tài nguyên và Môi trường", "Hiệp hội người tiêu dùng quốc tế"], 0),
        quiz("Khi mua phải hàng giả trên sàn TMĐT (ví dụ Shopee), người mua cần chuẩn bị bằng chứng gì để yêu cầu hoàn tiền?", "Video khui hàng, ảnh chụp chi tiết lỗi giả nhái, đối chiếu với mô tả của nhà sản xuất.", ["Hóa đơn ăn uống", "Video khui hàng và ảnh đối chiếu chứng minh hàng giả nhái", "Chỉ cần gửi tin nhắn phàn nàn", "Ảnh chụp màn hình điện thoại"], 1),
        quiz("Người bán cam kết 'Đền tiền gấp 10 lần nếu phát hiện hàng giả' có bắt buộc phải thực hiện theo thỏa thuận không?", "Có, đây là cam kết dân sự có hiệu lực ràng buộc trách nhiệm của bên bán đối với bên mua.", ["Không bắt buộc", "Có bắt buộc thực hiện theo thỏa thuận cam kết", "Chỉ bắt buộc đền gấp đôi", "Do sàn thương mại điện tử quyết định mức đền"], 1),
        quiz("Việc cố ý bán hàng giả, hàng nhái nhưng giới thiệu là hàng chính hãng để lừa người mua có thể cấu thành tội gì?", "Tội lừa dối khách hàng hoặc tội lừa đảo chiếm đoạt tài sản.", ["Tội vi phạm bản quyền tác giả", "Tội lừa dối khách hàng hoặc lừa đảo chiếm đoạt tài sản", "Tội vô ý gây thiệt hại tài sản", "Không cấu thành tội danh hình sự nào"], 1),
        quiz("Tổ chức xã hội nào hỗ trợ người tiêu dùng bảo vệ quyền lợi khi mua phải hàng giả tại Việt Nam?", "Hội Bảo vệ quyền lợi người tiêu dùng Việt Nam - VICOPRO.", ["Hội Bảo vệ quyền lợi người tiêu dùng Việt Nam", "Hội Cựu chiến binh", "Hội Khuyến học", "Hiệp hội doanh nghiệp trẻ"], 0),
        quiz("Khi nghi ngờ sản phẩm mỹ phẩm hoặc thực phẩm chức năng là hàng giả, người tiêu dùng có nên sử dụng thử không?", "Tuyệt đối không sử dụng vì có thể gây tổn hại nghiêm trọng đến sức khỏe và tính mạng.", ["Nên dùng thử lượng nhỏ xem có dị ứng không", "Tuyệt đối không sử dụng để bảo vệ sức khỏe bản thân", "Cứ dùng bình thường nếu thấy mùi thơm", "Đem tặng cho người khác"], 1),
        quiz("Tem chống hàng giả công nghệ cao thường sử dụng phương pháp nào để xác thực?", "Quét mã QR code phủ bạc gửi tin nhắn SMS xác thực hoặc công cụ kiểm tra hologram.", ["Chỉ dùng màu sắc in nổi bật", "Quét mã QR code phủ bạc gửi tin nhắn SMS xác thực hoặc tem hologram", "Chữ ký tay của giám đốc hãng", "Không thể làm giả tem này"], 1),
      ];

    case "bao-ve-thong-tin-nguoi-dung":
      return [
        quiz("Quyền được an toàn thông tin của người tiêu dùng được quy định thế nào trong Luật Bảo vệ quyền lợi người tiêu dùng?", "Thông tin của người tiêu dùng phải được bảo đảm an toàn, bí mật và chỉ thu thập khi có sự đồng ý.", ["Được phép chia sẻ tự do cho các doanh nghiệp khác quảng cáo", "Thông tin phải được bảo đảm an toàn, bí mật và chỉ thu thập khi có sự đồng ý", "Người bán được quyền thu thập bất kỳ thông tin nào họ muốn", "Chỉ bảo mật thông tin đối với khách hàng VIP"], 1),
        quiz("Tổ chức kinh doanh có được tự ý chuyển giao dữ liệu cá nhân của người mua cho bên thứ ba để quảng cáo không?", "Tuyệt đối không được chuyển giao khi chưa có sự đồng ý của người tiêu dùng, trừ trường hợp luật định.", ["Được phép nếu ghi trong điều khoản nhỏ khó nhìn của trang web", "Tuyệt đối không được chuyển giao khi chưa có sự đồng ý của người tiêu dùng", "Được phép nếu bán lại với giá rẻ", "Chỉ được chuyển giao dữ liệu số điện thoại"], 1),
        quiz("Doanh nghiệp thu thập thông tin người tiêu dùng phải xây dựng chính sách gì công khai?", "Chính sách bảo mật thông tin (Privacy Policy) nêu rõ mục đích, phạm vi sử dụng và thời hạn lưu trữ.", ["Bản cam kết doanh thu bán hàng", "Chính sách bảo mật thông tin (Privacy Policy) nêu rõ mục đích, phạm vi", "Quy chế xử phạt nhân viên đi muộn", "Bảng giá sản phẩm dịch vụ"], 1),
        quiz("Việc siêu thị tự ý yêu cầu khách hàng cung cấp số CCCD khi thanh toán hóa đơn thông thường có đúng quy định không?", "Không đúng, chỉ thu thập các thông tin thực sự cần thiết phục vụ trực tiếp cho giao dịch thanh toán.", ["Đúng quy định vì để quản lý khách hàng", "Không đúng quy định vì chỉ thu thập thông tin thực sự cần thiết cho giao dịch", "Chỉ đúng khi hóa đơn dưới 1 triệu", "Tùy thuộc vào yêu cầu của nhân viên thu ngân"], 1),
        quiz("Người tiêu dùng có quyền yêu cầu doanh nghiệp thực hiện hành động nào đối với thông tin cá nhân của mình?", "Quyền yêu cầu kiểm tra, hiệu đính, cập nhật hoặc xóa bỏ thông tin lưu trữ.", ["Yêu cầu doanh nghiệp trả lương hàng tháng cho mình", "Yêu cầu kiểm tra, hiệu đính, cập nhật hoặc xóa bỏ thông tin lưu trữ của mình", "Yêu cầu xóa thông tin của các khách hàng khác", "Không có quyền gì sau khi đã bấm đồng ý"], 1),
        quiz("Hành vi rò rỉ thông tin thẻ tín dụng của khách hàng do hệ thống bảo mật kém của shop bị xử phạt thế nào?", "Doanh nghiệp bị xử phạt hành chính và phải bồi thường thiệt hại phát sinh cho khách hàng.", ["Không bị phạt nếu do lỗi hacker", "Doanh nghiệp bị xử phạt hành chính và phải bồi thường thiệt hại phát sinh", "Chỉ bị phạt cảnh cáo miệng", "Khách hàng tự chịu trách nhiệm vì không tự bảo mật thẻ"], 1),
        quiz("Khi đăng ký thẻ thành viên mua sắm, bạn nên lưu ý điều gì về điều khoản thông tin?", "Đọc kỹ các mục cam kết bảo mật và quyền chia sẻ thông tin cho các đối tác liên kết của doanh nghiệp.", ["Bỏ qua không cần đọc điều khoản", "Đọc kỹ mục cam kết bảo mật và quyền chia sẻ thông tin của doanh nghiệp", "Điền tất cả thông tin gia đình để nhận thêm quà", "Không cần quan tâm vì hệ thống luôn bảo mật tuyệt đối"], 1),
        quiz("Doanh nghiệp sử dụng thông tin khách hàng để gửi tin nhắn quảng cáo (spam SMS) khi chưa được đồng ý bị phạt thế nào?", "Bị xử phạt vi phạm hành chính theo quy định về chống tin nhắn rác.", ["Được phép gửi tự do không giới hạn", "Bị xử phạt vi phạm hành chính theo quy định chống tin nhắn rác", "Chỉ bị phạt khi gửi vào ban đêm", "Chỉ bị nhắc nhở nhẹ"], 1),
        quiz("Cách hạn chế bị lộ thông tin số điện thoại cá nhân khi mua sắm tại cửa hàng là gì?", "Từ chối cung cấp số điện thoại nếu không bắt buộc hoặc sử dụng đầu số liên lạc phụ.", ["Điền bừa số điện thoại của người khác", "Từ chối cung cấp nếu không bắt buộc hoặc dùng số điện thoại phụ", "Cung cấp ngay mỗi khi nhân viên hỏi để tích điểm", "Đổi số điện thoại hàng tháng"], 1),
        quiz("Cơ quan quản lý nhà nước về bảo vệ quyền lợi người tiêu dùng tại Việt Nam là đơn vị nào?", "Ủy ban Cạnh tranh Quốc gia trực thuộc Bộ Công Thương.", ["Ủy ban Cạnh tranh Quốc gia trực thuộc Bộ Công Thương", "Bộ Công an", "Tổng cục Thuế", "Hiệp hội doanh nghiệp Việt Nam"], 0),
      ];

    case "doc-nhan-mac-han-su-dung":
      return [
        quiz("Nhãn hàng hóa lưu thông tại Việt Nam bắt buộc phải ghi nhận các nội dung nào bằng tiếng Việt?", "Tên hàng hóa; Tên và địa chỉ tổ chức chịu trách nhiệm; Xuất xứ hàng hóa; Các nội dung bắt buộc khác tùy loại sản phẩm.", ["Chỉ cần ghi tên sản phẩm bằng tiếng Anh", "Tên hàng hóa; Tên địa chỉ tổ chức chịu trách nhiệm; Xuất xứ hàng hóa", "Chỉ cần ghi giá tiền bằng tiếng Việt", "Không bắt buộc ghi nhãn đối với thực phẩm"], 1),
        quiz("Ký hiệu 'EXP' hoặc 'HSD' trên bao bì sản phẩm biểu thị thông tin gì?", "Hạn sử dụng (Expiry Date) - thời mốc cuối cùng sản phẩm được phép lưu hành và sử dụng an toàn.", ["Ngày sản xuất sản phẩm", "Hạn sử dụng (thời mốc cuối cùng sản phẩm được phép sử dụng an toàn)", "Nơi sản xuất sản phẩm", "Mã vạch của sản phẩm"], 1),
        quiz("Ký hiệu 'MFG' hoặc 'NSX' trên bao bì sản phẩm biểu thị thông tin gì?", "Ngày sản xuất (Manufacturing Date) - thời điểm sản phẩm được đóng gói hoàn thiện.", ["Hạn sử dụng sản phẩm", "Ngày sản xuất (thời điểm sản phẩm được đóng gói hoàn thiện)", "Hạn sử dụng sau khi mở nắp", "Tên nhà máy sản xuất"], 1),
        quiz("Hạn sử dụng sau khi mở nắp (PAO - Period After Opening) thường được ký hiệu bằng hình vẽ gì?", "Hình chiếc hũ mở nắp kèm số tháng, ví dụ '12M' là 12 tháng.", ["Hình đồng hồ cát", "Hình chiếc hũ mở nắp kèm số tháng bên trong (ví dụ 12M)", "Hình mũi tên xoay tròn", "Hình bông hoa màu xanh"], 1),
        quiz("Hành vi kinh doanh hàng hóa quá hạn sử dụng bị xử phạt thế nào?", "Bị phạt tiền hành chính, tịch thu sản phẩm và buộc tiêu hủy toàn bộ hàng quá hạn.", ["Không bị phạt nếu giảm giá 50%", "Bị phạt tiền hành chính, tịch thu sản phẩm và buộc tiêu hủy toàn bộ", "Chỉ bị phạt khi người mua ăn vào bị đau bụng", "Được phép bán nếu đổi bao bì mới"], 1),
        quiz("Thực phẩm đóng hộp có hạn sử dụng ghi dạng 'Best Before' (Sử dụng tốt nhất trước ngày) có ý nghĩa gì?", "Sau ngày này sản phẩm vẫn có thể ăn được nhưng chất lượng, hương vị không còn đạt mức tốt nhất.", ["Sản phẩm bắt buộc phải vứt đi ngay sau ngày này", "Sau ngày này sản phẩm vẫn dùng được nhưng chất lượng, hương vị giảm đi", "Sản phẩm chỉ được dùng từ ngày này trở đi", "Không có ý nghĩa gì về hạn dùng"], 1),
        quiz("Nhãn sản phẩm nhập khẩu bắt buộc phải có thêm bộ phận nào khi bán ra thị trường Việt Nam?", "Phải có nhãn phụ bằng tiếng Việt dịch đầy đủ nội dung bắt buộc từ nhãn gốc.", ["Tem chứng nhận hàng xách tay", "Phải có nhãn phụ bằng tiếng Việt dịch đầy đủ nội dung bắt buộc từ nhãn gốc", "Ảnh chụp hóa đơn mua hàng tại nước ngoài", "Chữ ký của người nhập khẩu"], 1),
        quiz("Tại sao việc đọc kỹ thành phần (Ingredients) trên nhãn mỹ phẩm và thực phẩm là cực kỳ quan trọng?", "Giúp người tiêu dùng nhận diện các chất bảo quản, hương liệu hoặc thành phần có thể gây dị ứng cho bản thân.", ["Để biết sản phẩm có nhiều màu sắc đẹp không", "Giúp nhận diện các thành phần có thể gây dị ứng cho bản thân", "Để so sánh giá với các sản phẩm khác", "Để học công thức tự làm tại nhà"], 1),
        quiz("Thông tin hướng dẫn bảo quan trên nhãn sản phẩm có vai trò gì?", "Bảo đảm sản phẩm giữ được chất lượng tốt nhất trong suốt thời hạn sử dụng quy định.", ["Để trang trí nhãn mác", "Bảo đảm sản phẩm giữ được chất lượng tốt nhất trong thời hạn sử dụng", "Để tăng giá trị thương hiệu", "Chỉ dành cho nhà phân phối không dành cho người dùng"], 1),
        quiz("Cửa hàng cố ý tẩy xóa, sửa chữa hạn sử dụng trên bao bì để bán hàng tồn kho bị xử lý thế nào?", "Bị xử phạt hành chính nặng về hành vi gian lận thương mại hoặc có thể bị truy cứu trách nhiệm hình sự.", ["Được coi là hành động tiết kiệm chống lãng phí", "Bị xử phạt hành chính nặng về hành vi gian lận hoặc truy cứu trách nhiệm hình sự", "Chỉ bị phạt tiền 200.000đ", "Không bị xử phạt nếu sản phẩm chưa hỏng"], 1),
      ];

    case "khieu-nai-ve-sinh-an-toan":
      return [
        quiz("Khi phát hiện đồ ăn tại nhà hàng có dị vật hoặc bị ôi thiu, người tiêu dùng nên làm gì đầu tiên?", "Chụp ảnh, quay video làm bằng chứng và phản ánh ngay lập tức với quản lý nhà hàng.", ["Chụp ảnh quay video làm bằng chứng và phản ánh với quản lý nhà hàng ngay", "Bỏ qua thanh toán tiền rồi đi về", "Đăng ngay bài nói xấu lên facebook không cần liên hệ quán", "Tự ý đi vào bếp của quán để kiểm tra"], 0),
        quiz("Trường hợp bị ngộ độc thực phẩm sau khi ăn tại quán, người bệnh cần lưu giữ chứng cứ nào để khiếu nại?", "Hóa đơn thanh toán của quán ăn và bệnh án, kết luận chẩn đoán ngộ độc của cơ sở y tế.", ["Chỉ cần ảnh chụp món ăn", "Hóa đơn thanh toán của quán và bệnh án chẩn đoán của cơ sở y tế", "Tên của nhân viên phục vụ bàn", "Không cần giữ gì chỉ cần lời nói chứng minh"], 1),
        quiz("Nhà hàng có trách nhiệm gì khi gây ra ngộ độc thực phẩm cho khách hàng?", "Chịu trách nhiệm bồi thường toàn bộ chi phí điều trị y tế, thu nhập bị mất và tổn thất tinh thần cho nạn nhân.", ["Không chịu trách nhiệm nếu khách hàng đã ký hóa đơn thanh toán", "Bồi thường chi phí y tế, thu nhập bị mất và tổn thất tinh thần cho nạn nhân", "Chỉ cần xin lỗi và tặng voucher giảm giá lần sau", "Đền bù bằng một bữa ăn miễn phí tương tự"], 1),
        quiz("Cơ quan nào có thẩm quyền tiếp nhận phản ánh và thanh tra cơ sở vi phạm an toàn thực phẩm tại địa phương?", "Chi cục An toàn vệ sinh thực phẩm hoặc Đội Quản lý thị trường.", ["Chi cục An toàn vệ sinh thực phẩm hoặc Đội Quản lý thị trường", "Ủy ban nhân dân cấp tỉnh trực tiếp", "Hội khuyến học địa phương", "Sở Tài nguyên và Môi trường"], 0),
        quiz("Cơ sở dịch vụ ăn uống bắt buộc phải có giấy chứng nhận nào để được phép hoạt động hợp pháp?", "Giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm.", ["Giấy phép xây dựng cửa hàng", "Giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm", "Bằng tốt nghiệp ngành nấu ăn của đầu bếp", "Giấy chứng nhận đăng ký nhãn hiệu"], 1),
        quiz("Mức phạt tiền đối với cơ sở kinh doanh sử dụng nguyên liệu hết hạn sử dụng để chế biến thức ăn là thế nào?", "Bị xử phạt tiền hành chính rất nặng và có thể bị đình chỉ hoạt động có thời hạn.", ["Chỉ bị phạt cảnh cáo", "Bị xử phạt tiền hành chính rất nặng và có thể bị đình chỉ hoạt động", "Bị phạt 1 triệu đồng", "Không bị phạt nếu đồ ăn vẫn ngon"], 1),
        quiz("Tại sao người tiêu dùng nên giữ lại hóa đơn (bill thanh toán) khi đi ăn uống?", "Hóa đơn là bằng chứng pháp lý chứng minh mối quan hệ tiêu dùng dịch vụ giữa khách hàng và nhà hàng.", ["Để về nhà khai thuế thu nhập cá nhân", "Hóa đơn là bằng chứng chứng minh quan hệ tiêu dùng dịch vụ giữa khách hàng và nhà hàng", "Để tích điểm nhận quà của quán", "Để chụp ảnh khoe lên mạng xã hội"], 1),
        quiz("Hành vi kinh doanh thực phẩm không rõ nguồn gốc xuất xứ bị xử lý thế nào?", "Bị xử phạt hành chính, tịch thu và tiêu hủy toàn bộ thực phẩm vi phạm.", ["Được phép bán bình thường nếu giá rẻ", "Bị xử phạt hành chính, tịch thu và tiêu hủy thực phẩm vi phạm", "Chỉ phạt tiền đối với người mua", "Chỉ bị nhắc nhở nhẹ"], 1),
        quiz("Theo Luật An toàn thực phẩm, người tiêu dùng có nghĩa vụ gì khi phát hiện hành vi vi phạm ATTP?", "Có nghĩa vụ thông tin, báo cáo cho cơ quan chức năng để kịp thời xử lý ngăn chặn.", ["Giữ bí mật tuyệt đối để tránh ảnh hưởng đến quán", "Có nghĩa vụ thông tin, báo cáo cho cơ quan chức năng để xử lý kịp thời", "Tự mình đi xử phạt quán ăn đó", "Chia sẻ cho bạn bè cùng đến ăn ủng hộ"], 1),
        quiz("Thời hạn giải quyết khiếu nại thông thường của doanh nghiệp đối với khiếu nại của khách hàng là bao lâu?", "Do hai bên thỏa thuận thương lượng, nếu không thành có thể gửi đơn khởi kiện ra Tòa án.", ["Cố định trong vòng 3 ngày", "Do hai bên thỏa thuận, nếu không thành có thể khởi kiện ra Tòa án", "Vô thời hạn theo ý muốn của doanh nghiệp", "Phải giải quyết ngay lập tức trong 24 giờ"], 1),
      ];

    case "hop-dong-theo-mau-bat-loi":
      return [
        quiz("Hợp đồng theo mẫu là loại hợp đồng thế nào?", "Là hợp đồng do một bên soạn thảo sẵn để giao dịch với nhiều khách hàng theo các điều khoản chung.", ["Hợp đồng do hai bên cùng nhau thảo luận viết ra", "Hợp đồng do một bên soạn thảo sẵn để giao dịch với nhiều khách hàng", "Hợp đồng viết tay không có dấu đỏ", "Hợp đồng chỉ dành cho các doanh nghiệp nhà nước"], 1),
        quiz("Theo Luật Bảo vệ quyền lợi người tiêu dùng, điều khoản nào trong hợp đồng theo mẫu bị coi là vô hiệu?", "Điều khoản loại trừ trách nhiệm của bên bán; hạn chế quyền khiếu nại, khởi kiện của người mua; quy định mức phạt vi phạm quá cao.", ["Điều khoản ghi rõ giá tiền sản phẩm", "Điều khoản loại bỏ trách nhiệm bên bán, hạn chế quyền khởi kiện của người mua", "Điều khoản quy định thời gian giao hàng", "Điều khoản quy định địa chỉ bảo hành"], 1),
        quiz("Khi điều khoản trong hợp đồng theo mẫu có nhiều cách hiểu khác nhau thì được giải thích theo hướng nào?", "Được giải thích theo hướng có lợi cho người tiêu dùng (bên yếu thế).", ["Theo hướng có lợi cho doanh nghiệp soạn thảo", "Được giải thích theo hướng có lợi cho người tiêu dùng", "Được giải thích theo hướng trung lập hòa cả làng", "Do doanh nghiệp tự quyết định cách hiểu"], 1),
        quiz("Trước khi ký hợp đồng dịch vụ theo mẫu (như thẻ tập gym, bảo hiểm), người mua cần làm gì?", "Đọc kỹ các điều khoản về điều kiện chấm dứt hợp đồng trước hạn, phí phạt và quy định thanh toán.", ["Ký ngay lập tức không cần đọc để tiết kiệm thời gian", "Đọc kỹ các điều khoản về chấm dứt trước hạn, phí phạt và thanh toán", "Nhờ nhân viên tư vấn ký hộ", "Chỉ cần quan tâm đến giá tiền khuyến mại"], 1),
        quiz("Doanh nghiệp có được phép tự ý thay đổi nội dung hợp đồng theo mẫu mà không thông báo cho khách hàng không?", "Không được phép đơn phương thay đổi mà không có sự thỏa thuận hoặc thông báo trước theo quy định.", ["Được phép tự ý thay đổi khi thấy cần thiết", "Không được phép đơn phương thay đổi mà không có sự thỏa thuận hoặc thông báo trước", "Được phép thay đổi nếu ghi trong phụ lục ẩn", "Chỉ được thay đổi vào ngày lễ"], 1),
        quiz("Hợp đồng theo mẫu trong các lĩnh vực cung cấp điện, nước, viễn thông có bắt buộc phải đăng ký với cơ quan quản lý nhà nước không?", "Bắt buộc phải đăng ký và được phê duyệt bởi Bộ Công Thương hoặc Sở Công Thương trước khi áp dụng.", ["Không cần đăng ký", "Bắt buộc phải đăng ký và phê duyệt bởi Bộ/Sở Công Thương trước khi áp dụng", "Chỉ đăng ký khi khách hàng yêu cầu", "Chỉ đăng ký đối với doanh nghiệp tư nhân"], 1),
        quiz("Điều khoản phạt vi phạm hợp đồng dịch vụ thông thường tối đa là bao nhiêu phần trăm giá trị nghĩa vụ bị vi phạm theo Luật Thương mại?", "Tối đa 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm (đối với giao dịch thương mại).", ["8% giá trị phần nghĩa vụ hợp đồng bị vi phạm", "20% giá trị hợp đồng", "50% giá trị hợp đồng", "Không giới hạn mức phạt"], 0),
        quiz("Việc doanh nghiệp đưa điều khoản miễn trừ mọi trách nhiệm bồi thường thiệt hại do lỗi của mình vào hợp đồng có đúng luật không?", "Không đúng luật, điều khoản này bị coi là vô hiệu theo quy định bảo vệ người tiêu dùng.", ["Đúng luật vì là thỏa thuận dân sự tự nguyện", "Không đúng luật, điều khoản này bị coi là vô hiệu", "Đúng luật nếu khách hàng đồng ý ký", "Chỉ đúng luật đối với sản phẩm giá rẻ"], 1),
        quiz("Khi phát hiện hợp đồng theo mẫu có các điều khoản bất lợi trái pháp luật, người tiêu dùng có thể phản ánh đến đâu?", "Gửi đơn kiến nghị lên Cục Cạnh tranh và Bảo vệ người tiêu dùng để yêu cầu thanh tra, chấn chỉnh doanh nghiệp.", ["Gửi đơn kiến nghị lên Cục Cạnh tranh và Bảo vệ người tiêu dùng", "Đăng bài phản ánh lên các trang báo lá cải", "Tự ý ngừng trả các khoản nợ ngân hàng", "Không thể phản ánh đi đâu"], 0),
        quiz("Mục đích chính của việc pháp luật kiểm soát chặt chẽ hợp đồng theo mẫu là gì?", "Bảo đảm sự bình đẳng, bảo vệ bên yếu thế (người tiêu dùng) trước sự áp đặt của các doanh nghiệp lớn.", ["Để gây khó khăn cho hoạt động của các doanh nghiệp", "Bảo đảm sự bình đẳng, bảo vệ người tiêu dùng trước áp đặt của doanh nghiệp lớn", "Để nhà nước thu thêm thuế đăng ký hợp đồng", "Để giảm bớt số lượng hợp đồng giao dịch trên thị trường"], 1),
      ];

    default:
      return defaultQuestions;
  }
}

async function seedCommunityPosts(users: Awaited<ReturnType<typeof seedUsers>>) {
  console.log("Clearing existing community posts and comments...");
  await prisma.communityComment.deleteMany({});
  await prisma.communityPost.deleteMany({});

  console.log("Seeding community posts...");

  const post1 = await prisma.communityPost.create({
    data: {
      title: "Chủ nhà trọ không trả lại tiền cọc khi dọn đi đúng hạn",
      content: "Chào mọi người, em thuê phòng trọ ký hợp đồng 1 năm (từ 06/2025 đến 06/2026), đặt cọc 1 tháng tiền nhà (5 triệu đồng). Hết hạn hợp đồng, em báo trước 30 ngày dọn đi, bàn giao phòng sạch sẽ, không hư hỏng gì. Tuy nhiên, chủ nhà trọ viện cớ sơn tường bị cũ (dù là hao mòn tự nhiên) để trừ hết 5 triệu tiền cọc của em. Theo Bộ luật Dân sự, em có quyền đòi lại số tiền này không và nên làm thế nào ạ?",
      authorId: users.demo.id,
      authorName: "Người dùng Demo",
      category: "civil",
      tags: ["Thuê nhà", "Đặt cọc", "Tranh chấp", "Dân sự"],
      likes: 12,
      isSolved: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  });

  await prisma.communityComment.createMany({
    data: [
      {
        postId: post1.id,
        authorId: users.admin.id,
        authorName: "LEXI Admin",
        content: "Chào em, theo Điều 328 Bộ luật Dân sự 2015 về đặt cọc, nếu bên đặt cọc thực hiện đúng nghĩa vụ thì tài sản đặt cọc phải được trả lại. Việc hao mòn tự nhiên của sơn tường không được coi là hư hỏng do lỗi của bên thuê (trừ khi có thỏa thuận khác trong hợp đồng). Em nên chụp ảnh hiện trạng phòng, gửi tin nhắn yêu cầu thanh toán kèm trích dẫn luật. Nếu chủ nhà cố tình không trả, em có thể làm đơn khiếu nại lên UBND cấp xã/phường nơi có nhà trọ để được hòa giải nhé.",
        createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
      },
      {
        postId: post1.id,
        authorId: users.leaderboardUsers[0].id,
        authorName: "Minh Nguyễn",
        content: "Kinh nghiệm của mình là khi nhận phòng và trả phòng đều nên quay video lại làm bằng chứng, tránh bị chủ nhà chèn ép bừa bãi.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }
    ]
  });

  const post2 = await prisma.communityPost.create({
    data: {
      title: "Nhận cuộc gọi tự xưng nhân viên Shopee báo trúng thưởng xe máy",
      content: "Mọi người cảnh giác nhé. Hôm nay mình nhận được cuộc gọi từ số 0912.xxx.xxx tự xưng là CSKH Shopee thông báo tài khoản mình trúng thưởng sự kiện tri ân một chiếc xe Honda SH. Họ yêu cầu mình kết bạn Zalo để làm thủ tục nhận giải, nhưng yêu cầu mình phải chuyển khoản trước 2 triệu đồng tiền thuế thu nhập cá nhân/phí vận chuyển vào số tài khoản cá nhân. Đây chắc chắn là lừa đảo đúng không ạ? Mình có nên báo công an không?",
      authorId: users.leaderboardUsers[1].id,
      authorName: "Linh Trần",
      category: "criminal",
      tags: ["Lừa đảo", "Giả danh", "Hình sự", "Shopee"],
      likes: 24,
      isSolved: false,
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
      updatedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
    }
  });

  await prisma.communityComment.createMany({
    data: [
      {
        postId: post2.id,
        authorId: users.admin.id,
        authorName: "LEXI Admin",
        content: "Chào bạn, đây 100% là hành vi lừa đảo chiếm đoạt tài sản. Shopee hoặc các đơn vị uy tín không bao giờ yêu cầu khách hàng nộp thuế/phí trước vào tài khoản cá nhân. Bạn tuyệt đối không chuyển khoản, không cung cấp OTP hay thông tin cá nhân. Bạn có thể chụp ảnh tin nhắn, số điện thoại lừa đảo và gửi phản ánh lên Cục An toàn thông tin (qua trang canhbao.khonggianmang.vn) or gọi 156 để báo cáo cuộc gọi rác lừa đảo nhé.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        postId: post2.id,
        authorId: users.leaderboardUsers[2].id,
        authorName: "An Phạm",
        content: "Gần đây nhiều người bị lừa kiểu này lắm, có người mất cả trăm triệu vì làm theo hướng dẫn rồi bị dẫn dụ vào các app đầu tư nhiệm vụ nữa.",
        createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
      }
    ]
  });

  const post3 = await prisma.communityPost.create({
    data: {
      title: "Nghỉ việc đột xuất do ốm đau có phải bồi thường không?",
      content: "Tôi đang làm nhân viên kinh doanh, ký hợp đồng lao động không xác định thời hạn. Do đột ngột phát hiện bệnh cần điều trị dài ngày, tôi muốn xin nghỉ việc ngay. Theo luật lao động thì tôi phải báo trước 45 ngày, nhưng hoàn cảnh sức khỏe không cho phép đi làm tiếp. Nếu tôi nghỉ ngang ngay lập tức thì có bị coi là đơn phương chấm dứt HĐLĐ trái luật không? Có phải bồi thường tiền lương cho những ngày không báo trước không?",
      authorId: users.leaderboardUsers[2].id,
      authorName: "An Phạm",
      category: "civil",
      tags: ["Nghỉ việc", "Luật lao động", "Bồi thường"],
      likes: 8,
      isSolved: true,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    }
  });

  await prisma.communityComment.createMany({
    data: [
      {
        postId: post3.id,
        authorId: users.admin.id,
        authorName: "LEXI Admin",
        content: "Chào bạn, theo quy định tại Điều 35 Bộ luật Lao động 2019, người lao động có quyền đơn phương chấm dứt hợp đồng lao động không cần báo trước nếu bị ốm đau, tai nạn đã điều trị 90 ngày liên tục (đối với HĐLĐ xác định thời hạn dưới 12 tháng) hoặc đã điều trị mà khả năng lao động chưa hồi phục. Tuy nhiên, nếu của bạn là hợp đồng không xác định thời hạn, bạn nên làm đơn xin nghỉ việc kèm theo giấy xác nhận bệnh án của cơ sở y tế để thỏa thuận với người sử dụng lao động nghỉ hưởng chế độ ốm đau của BHXH, hoặc thỏa thuận chấm dứt hợp đồng lao động để tránh rủi ro pháp lý nghỉ việc trái luật nhé.",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      }
    ]
  });

  console.log("Community posts and comments seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
