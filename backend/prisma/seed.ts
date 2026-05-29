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
            fullName: "Nguoi dung Demo",
            avatarUrl: "https://i.pravatar.cc/160?img=32",
            xp: 460,
            streak: 7,
          },
          update: {
            fullName: "Nguoi dung Demo",
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
          fullName: "Nguoi dung Demo",
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
      ["minh@lexi.vn", "Minh Nguyen", 390, "https://i.pravatar.cc/160?img=5"],
      ["linh@lexi.vn", "Linh Tran", 335, "https://i.pravatar.cc/160?img=47"],
      ["an@lexi.vn", "An Pham", 280, "https://i.pravatar.cc/160?img=15"],
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
        title: "Luat lao dong",
        description: "Quyen loi, hop dong, luong thu viec va nghi phep.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/1006/1006555.png",
        sortOrder: 1,
        isActive: true,
      },
      create: {
        slug: "luat-lao-dong",
        title: "Luat lao dong",
        description: "Quyen loi, hop dong, luong thu viec va nghi phep.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/1006/1006555.png",
        sortOrder: 1,
      },
    }),
    traffic: await prisma.category.upsert({
      where: { slug: "luat-giao-thong" },
      update: {
        title: "Luat giao thong",
        description: "Toc do, bien bao, giay to va xu phat thuong gap.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/2933/2933924.png",
        sortOrder: 2,
        isActive: true,
      },
      create: {
        slug: "luat-giao-thong",
        title: "Luat giao thong",
        description: "Toc do, bien bao, giay to va xu phat thuong gap.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/2933/2933924.png",
        sortOrder: 2,
      },
    }),
    digital: await prisma.category.upsert({
      where: { slug: "an-toan-so" },
      update: {
        title: "An toan so",
        description: "Nhan dien lua dao online va bao ve du lieu ca nhan.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/6124/6124996.png",
        sortOrder: 3,
        isActive: true,
      },
      create: {
        slug: "an-toan-so",
        title: "An toan so",
        description: "Nhan dien lua dao online va bao ve du lieu ca nhan.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/6124/6124996.png",
        sortOrder: 3,
      },
    }),
    scam: await prisma.category.upsert({
      where: { slug: "lua-dao-online" },
      update: {
        title: "Lua dao online",
        description: "Cac chien thuat lua dao qua mang va cach xu ly an toan.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/6124/6124996.png",
        sortOrder: 4,
        isActive: true,
      },
      create: {
        slug: "lua-dao-online",
        title: "Lua dao online",
        description: "Cac chien thuat lua dao qua mang va cach xu ly an toan.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/6124/6124996.png",
        sortOrder: 4,
      },
    }),
    consumer: await prisma.category.upsert({
      where: { slug: "bao-ve-nguoi-tieu-dung" },
      update: {
        title: "Bao ve nguoi tieu dung",
        description: "Doi tra, bao hanh va khieu nai khi mua hang.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
        sortOrder: 5,
        isActive: true,
      },
      create: {
        slug: "bao-ve-nguoi-tieu-dung",
        title: "Bao ve nguoi tieu dung",
        description: "Doi tra, bao hanh va khieu nai khi mua hang.",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
        sortOrder: 5,
      },
    }),
  };

  const modules = {
    laborContract: await upsertModule({
      categoryId: categories.labor.id,
      slug: "hop-dong-lao-dong",
      title: "Hop dong lao dong",
      description: "Cac diem can nam truoc khi ky hoac cham dut hop dong.",
      sortOrder: 1,
    }),
    laborLeave: await upsertModule({
      categoryId: categories.labor.id,
      slug: "nghi-phep-va-luong",
      title: "Nghi phep va tien luong",
      description: "Luong thu viec, nghi hang nam va nhung khoan can duoc tra.",
      sortOrder: 2,
    }),
    trafficBasics: await upsertModule({
      categoryId: categories.traffic.id,
      slug: "quy-tac-di-duong",
      title: "Quy tac di duong",
      description: "Toc do, giay to va tinh huong bi xu phat.",
      sortOrder: 1,
    }),
    trafficPapers: await upsertModule({
      categoryId: categories.traffic.id,
      slug: "giay-to-khi-di-duong",
      title: "Giay to khi di duong",
      description:
        "GPLX, dang ky xe, bao hiem va cach ung xu khi duoc kiem tra.",
      sortOrder: 2,
    }),
    antiScam: await upsertModule({
      categoryId: categories.digital.id,
      slug: "phishing-va-lua-dao",
      title: "Phishing va lua dao",
      description:
        "Dau hieu canh bao khi nhan link, ma OTP hoac loi moi dau tu.",
      sortOrder: 1,
    }),
    accountSafety: await upsertModule({
      categoryId: categories.digital.id,
      slug: "bao-ve-tai-khoan",
      title: "Bao ve tai khoan",
      description:
        "Mat khau, OTP, thiet bi dang nhap va cac buoc khoa tai khoan.",
      sortOrder: 2,
    }),
    scamInvestment: await upsertModule({
      categoryId: categories.scam.id,
      slug: "lua-dao-dau-tu",
      title: "Lua dao dau tu",
      description:
        "Nhan dien loi moi loi nhuan cao, app gia mao va nho nap tien.",
      sortOrder: 1,
    }),
    scamShopping: await upsertModule({
      categoryId: categories.scam.id,
      slug: "lua-dao-mua-ban",
      title: "Lua dao mua ban",
      description:
        "Chuyen khoan coc, shop ao va cach giu bang chung giao dich.",
      sortOrder: 2,
    }),
    shopping: await upsertModule({
      categoryId: categories.consumer.id,
      slug: "mua-hang-online",
      title: "Mua hang online",
      description: "Quyen doi tra, thong tin san pham va bang chung giao dich.",
      sortOrder: 1,
    }),
    warranty: await upsertModule({
      categoryId: categories.consumer.id,
      slug: "bao-hanh-va-doi-tra",
      title: "Bao hanh va doi tra",
      description:
        "Khi nao duoc bao hanh, doi hang va cach gui yeu cau ro rang.",
      sortOrder: 2,
    }),
  };

  const lessonSeeds: LessonSeed[] = [
    {
      moduleId: modules.laborContract.id,
      slug: "thu-viec-toi-da-bao-lau",
      title: "Thoi gian thu viec toi da bao lau?",
      content:
        "Thoi gian thu viec phu thuoc vao tinh chat cong viec. Vi tri quan ly doanh nghiep co the thu viec toi da 180 ngay; cong viec can trinh do cao dang tro len toi da 60 ngay; trung cap, cong nhan ky thuat, nhan vien nghiep vu toi da 30 ngay; cac cong viec khac toi da 6 ngay lam viec.",
      sourceTitle: "Bo luat Lao dong 2019",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=137155",
      legalDocumentNo: "45/2019/QH14",
      effectiveDate: new Date("2021-01-01T00:00:00.000Z"),
      reviewerNote:
        "Demo summary for learning only; check source law before applying.",
      sortOrder: 1,
      videoUrl,
      questions: [
        quiz(
          "Cong viec can trinh do dai hoc thu viec toi da bao lau?",
          "Nhom can trinh do cao dang tro len duoc thu viec toi da 60 ngay.",
          ["30 ngay", "60 ngay", "90 ngay", "180 ngay"],
          1
        ),
        quiz(
          "Luong thu viec toi thieu bang bao nhieu phan tram luong cua cong viec?",
          "Luong thu viec do hai ben thoa thuan nhung it nhat bang 85%.",
          ["50%", "70%", "85%", "100%"],
          2
        ),
      ],
    },
    {
      moduleId: modules.laborContract.id,
      slug: "don-phuong-cham-dut-hop-dong",
      title: "Bao truoc khi nghi viec the nao?",
      content:
        "Nguoi lao dong thuong phai bao truoc khi don phuong cham dut hop dong. Thoi han bao truoc phu thuoc loai hop dong va nhom cong viec. Mot so truong hop nhu khong duoc tra luong, bi nguoc dai, bi quay roi tai noi lam viec co the nghi ma khong can bao truoc.",
      sourceTitle: "Bo luat Lao dong 2019",
      sourceUrl:
        "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=137155#dieu35",
      legalDocumentNo: "45/2019/QH14",
      effectiveDate: new Date("2021-01-01T00:00:00.000Z"),
      reviewerNote: "Use for demo of quiz, mistakes and recommendations.",
      sortOrder: 2,
      questions: [
        quiz(
          "Neu bi cong ty khong tra luong dung han, nguoi lao dong co the lam gi?",
          "Day la mot trong cac truong hop co the cham dut hop dong ma khong can bao truoc theo dieu kien luat dinh.",
          [
            "Bat buoc lam them 30 ngay",
            "Co the don phuong cham dut khong can bao truoc",
            "Khong co quyen gi",
            "Chi duoc nghi khi cong ty dong y",
          ],
          1
        ),
        quiz(
          "Viec bao truoc khi nghi viec phu thuoc yeu to nao?",
          "Thoi han bao truoc phu thuoc loai hop dong va tinh chat cong viec.",
          ["Loai hop dong", "Mau ao dong phuc", "So dong nghiep", "Ngay sinh"],
          0
        ),
      ],
    },
    {
      moduleId: modules.laborLeave.id,
      slug: "nghi-phep-nam",
      title: "Nghi phep nam co luong",
      content:
        "Nguoi lao dong lam du 12 thang cho mot nguoi su dung lao dong thuong co it nhat 12 ngay nghi hang nam huong nguyen luong. So ngay co the cao hon voi cong viec nang nhoc, doc hai, nguy hiem hoac nguoi lao dong chua thanh nien.",
      sourceTitle: "Bo luat Lao dong 2019",
      sourceUrl:
        "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=137155#dieu113",
      legalDocumentNo: "45/2019/QH14",
      effectiveDate: new Date("2021-01-01T00:00:00.000Z"),
      reviewerNote: "Good for daily challenge demo.",
      sortOrder: 1,
      questions: [
        quiz(
          "Lam du 12 thang trong dieu kien binh thuong co it nhat bao nhieu ngay nghi hang nam?",
          "Muc co ban thuong la 12 ngay nghi hang nam huong nguyen luong.",
          ["6 ngay", "10 ngay", "12 ngay", "24 ngay"],
          2
        ),
        quiz(
          "Nghi phep nam thong thuong co duoc huong luong khong?",
          "Nghi hang nam la ngay nghi huong nguyen luong theo quy dinh.",
          ["Co", "Khong", "Chi 50%", "Tuy y quan ly"],
          0
        ),
      ],
    },
    {
      moduleId: modules.trafficBasics.id,
      slug: "toc-do-trong-khu-dan-cu",
      title: "Toc do trong khu dong dan cu",
      content:
        "Khi di trong khu dong dan cu, nguoi lai xe can quan sat bien bao va loai duong. Voi duong doi co dai phan cach, toc do toi da thuong la 60 km/h; voi duong hai chieu khong co dai phan cach hoac duong mot chieu mot lan xe, thuong la 50 km/h.",
      sourceTitle: "Thong tu ve toc do va khoang cach an toan",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx",
      legalDocumentNo: "31/2019/TT-BGTVT",
      effectiveDate: new Date("2019-10-15T00:00:00.000Z"),
      reviewerNote: "Traffic lesson for module list and current lesson demo.",
      sortOrder: 1,
      questions: [
        quiz(
          "Trong khu dong dan cu, duong doi co dai phan cach thuong toi da bao nhieu?",
          "Muc thuong gap la 60 km/h neu khong co bien bao khac.",
          ["40 km/h", "50 km/h", "60 km/h", "80 km/h"],
          2
        ),
        quiz(
          "Khi co bien bao toc do khac voi muc chung, can lam gi?",
          "Bien bao tai hien truong la chi dan can tuan thu.",
          [
            "Theo bien bao",
            "Theo y kien ban be",
            "Di toc do tuy thich",
            "Chi can bat den",
          ],
          0
        ),
      ],
    },
    {
      moduleId: modules.trafficPapers.id,
      slug: "giay-to-can-mang-khi-lai-xe",
      title: "Giay to can mang khi lai xe",
      content:
        "Khi dieu khien phuong tien, nguoi lai xe nen mang giay phep lai xe phu hop, dang ky xe, chung nhan bao hiem bat buoc va giay to lien quan. Neu bi kiem tra, hay binh tinh xuat trinh giay to va ghi nhan thong tin xu ly neu can.",
      sourceTitle: "Quy dinh xu phat vi pham giao thong duong bo",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx",
      legalDocumentNo: "100/2019/ND-CP",
      effectiveDate: new Date("2020-01-01T00:00:00.000Z"),
      reviewerNote: "Traffic paperwork lesson for module demo.",
      sortOrder: 1,
      questions: [
        quiz(
          "Giay to nao thuong can mang khi lai xe?",
          "Nguoi lai xe can mang GPLX phu hop va giay to xe bat buoc.",
          [
            "Giay phep lai xe",
            "The thanh vien",
            "Hoa don ca phe",
            "Mat khau email",
          ],
          0
        ),
        quiz(
          "Khi duoc yeu cau kiem tra giay to, viec nen lam la gi?",
          "Nen binh tinh xuat trinh giay to va ghi nhan thong tin neu can khieu nai.",
          ["Binh tinh xuat trinh", "Bo chay", "Xoa tin nhan", "Dua OTP"],
          0
        ),
      ],
    },
    {
      moduleId: modules.antiScam.id,
      slug: "nhan-dien-link-phishing",
      title: "Nhan dien link phishing",
      content:
        "Link phishing thuong tao cam giac khan cap, yeu cau nhap mat khau, OTP hoac thong tin the. Hay kiem tra ten mien, khong bam link la, va lien he kenh chinh thuc neu thong bao lien quan tai khoan, ngan hang hoac don hang.",
      sourceTitle: "Khuyen nghi an toan thong tin ca nhan",
      sourceUrl: "https://khonggianmang.vn",
      legalDocumentNo: "Demo-Cyber-01",
      effectiveDate: new Date("2024-01-01T00:00:00.000Z"),
      reviewerNote: "Demo digital safety lesson.",
      sortOrder: 1,
      questions: [
        quiz(
          "Dau hieu nao thuong gap o link phishing?",
          "Phishing thuong dung su khan cap de ep nguoi dung nhap thong tin nhay cam.",
          [
            "Yeu cau OTP gap",
            "Co dieu khoan ro rang",
            "Ten mien dung chinh thuc",
            "Khong can thong tin ca nhan",
          ],
          0
        ),
        quiz(
          "Khi nghi ngo link ngan hang gia mao, viec nen lam la gi?",
          "Nen tu mo app/trang chinh thuc hoac goi tong dai chinh thuc.",
          [
            "Nhap OTP de kiem tra",
            "Chuyen tiep cho moi nguoi",
            "Lien he kenh chinh thuc",
            "Tat khoa man hinh",
          ],
          2
        ),
      ],
    },
    {
      moduleId: modules.accountSafety.id,
      slug: "bao-ve-otp-va-mat-khau",
      title: "Bao ve OTP va mat khau",
      content:
        "OTP va mat khau la thong tin bao mat ca nhan, khong chia se qua dien thoai, tin nhan hay form la. Khi nghi ngo bi lo thong tin, hay doi mat khau, dang xuat thiet bi la va lien he kenh ho tro chinh thuc.",
      sourceTitle: "Khuyen nghi bao ve du lieu ca nhan",
      sourceUrl: "https://khonggianmang.vn",
      legalDocumentNo: "Demo-Cyber-02",
      effectiveDate: new Date("2024-01-01T00:00:00.000Z"),
      reviewerNote: "Account safety lesson for An toan so category.",
      sortOrder: 1,
      questions: [
        quiz(
          "OTP co nen chia se cho nguoi tu xung la nhan vien ho tro khong?",
          "OTP la ma xac thuc ca nhan, khong nen chia se cho bat ky ai.",
          [
            "Co",
            "Khong",
            "Chi chia se vao ban dem",
            "Chi khi duoc hua tang qua",
          ],
          1
        ),
        quiz(
          "Khi nghi tai khoan bi lo mat khau, nen lam gi?",
          "Doi mat khau va dang xuat cac thiet bi la la buoc can lam som.",
          [
            "Doi mat khau",
            "Dang them anh ca nhan",
            "Chuyen tien kiem tra",
            "Bo qua",
          ],
          0
        ),
      ],
    },
    {
      moduleId: modules.scamInvestment.id,
      slug: "nhan-dien-app-dau-tu-gia-mao",
      title: "Nhan dien app dau tu gia mao",
      content:
        "Lua dao dau tu thuong hua loi nhuan cao, yeu cau nap tien lien tuc va tao ap luc moi them nguoi tham gia. Hay kiem tra phap nhan, giay phep, dieu khoan rut tien va canh giac voi loi cam ket chac chan co lai.",
      sourceTitle: "Canh bao lua dao dau tu truc tuyen",
      sourceUrl: "https://lexi.local/sources/lua-dao-dau-tu",
      legalDocumentNo: "DEMO-SCAM-01",
      effectiveDate: new Date("2026-01-01T00:00:00.000Z"),
      reviewerNote:
        "Scam investment lesson for legacy Lua dao online category.",
      sortOrder: 1,
      questions: [
        quiz(
          "Dau hieu nao dang nghi trong loi moi dau tu?",
          "Cam ket loi nhuan cao va chac chan la dau hieu can canh giac.",
          [
            "Cam ket loi nhuan chac chan",
            "Cong khai rui ro",
            "Hop dong ro rang",
            "Thong tin phap nhan minh bach",
          ],
          0
        ),
        quiz(
          "Truoc khi nap tien vao app dau tu la, nen lam gi?",
          "Can kiem tra phap nhan, giay phep va dieu kien rut tien.",
          [
            "Kiem tra phap nhan",
            "Nap thu toan bo tien",
            "Gui OTP cho tu van",
            "Muon tien ban be",
          ],
          0
        ),
      ],
    },
    {
      moduleId: modules.scamShopping.id,
      slug: "tranh-bi-lua-coc-mua-hang",
      title: "Tranh bi lua coc mua hang",
      content:
        "Khi mua hang qua mang xa hoi, hay kiem tra lich su ban hang, danh gia, thong tin nguoi nhan tien va uu tien kenh co bao ve nguoi mua. Neu can dat coc, nen luu hoa don, tin nhan va thoa thuan giao dich.",
      sourceTitle: "Canh bao lua dao mua ban online",
      sourceUrl: "https://lexi.local/sources/lua-dao-mua-ban",
      legalDocumentNo: "DEMO-SCAM-02",
      effectiveDate: new Date("2026-01-01T00:00:00.000Z"),
      reviewerNote: "Shopping scam lesson for legacy category.",
      sortOrder: 1,
      questions: [
        quiz(
          "Khi nguoi ban yeu cau dat coc gap, nen lam gi?",
          "Nen kiem tra nguoi ban va luu bang chung truoc khi chuyen tien.",
          [
            "Kiem tra va luu bang chung",
            "Chuyen ngay",
            "Gui OTP",
            "Xoa doan chat",
          ],
          0
        ),
        quiz(
          "Bang chung nao huu ich khi bi lua mua hang?",
          "Tin nhan, bien lai chuyen khoan va thong tin bai dang la bang chung quan trong.",
          [
            "Tin nhan va bien lai",
            "Mat khau app ngan hang",
            "Anh phong canh",
            "Lich su xem phim",
          ],
          0
        ),
      ],
    },
    {
      moduleId: modules.shopping.id,
      slug: "doi-tra-khi-mua-hang-online",
      title: "Doi tra khi mua hang online",
      content:
        "Khi mua hang online, nguoi tieu dung nen luu thong tin san pham, hoa don, tin nhan va chinh sach doi tra. Neu hang sai mo ta, kem chat luong hoac khong dung cam ket, cac bang chung nay giup yeu cau ho tro, doi tra hoac khieu nai.",
      sourceTitle: "Luat Bao ve quyen loi nguoi tieu dung",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx",
      legalDocumentNo: "19/2023/QH15",
      effectiveDate: new Date("2024-07-01T00:00:00.000Z"),
      reviewerNote: "Consumer protection lesson for remaining state demo.",
      sortOrder: 1,
      questions: [
        quiz(
          "Bang chung nao nen luu khi mua hang online?",
          "Hoa don, tin nhan, anh san pham va chinh sach doi tra deu huu ich khi can khieu nai.",
          [
            "Hoa don va tin nhan",
            "Mat khau tai khoan",
            "OTP ngan hang",
            "Khong can luu gi",
          ],
          0
        ),
        quiz(
          "Neu hang khong dung mo ta, nguoi mua nen lam gi dau tien?",
          "Nen lien he nguoi ban/san thuong mai kem bang chung truoc khi leo thang khieu nai.",
          [
            "Xoa lich su mua",
            "Gui yeu cau ho tro kem bang chung",
            "Bo qua",
            "Chuyen them tien",
          ],
          1
        ),
      ],
    },
    {
      moduleId: modules.warranty.id,
      slug: "yeu-cau-bao-hanh-dung-cach",
      title: "Yeu cau bao hanh dung cach",
      content:
        "Khi san pham con thoi han bao hanh, nguoi mua nen chuan bi hoa don, phieu bao hanh, anh/video loi va mo ta tinh trang. Yeu cau bao hanh nen ghi ro ngay mua, loi gap phai va mong muon sua, doi hoac hoan tien theo chinh sach.",
      sourceTitle: "Luat Bao ve quyen loi nguoi tieu dung",
      sourceUrl: "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx",
      legalDocumentNo: "19/2023/QH15",
      effectiveDate: new Date("2024-07-01T00:00:00.000Z"),
      reviewerNote: "Warranty lesson for consumer category.",
      sortOrder: 1,
      questions: [
        quiz(
          "Khi yeu cau bao hanh, nen chuan bi gi?",
          "Hoa don, phieu bao hanh va bang chung loi san pham giup xu ly nhanh hon.",
          [
            "Hoa don va bang chung loi",
            "OTP ngan hang",
            "Mat khau email",
            "Khong can gi",
          ],
          0
        ),
        quiz(
          "Yeu cau bao hanh nen ghi ro noi dung nao?",
          "Nen ghi ngay mua, loi gap phai va mong muon xu ly.",
          [
            "Loi gap phai va cach xu ly mong muon",
            "So thich ca nhan",
            "Ten bai hat",
            "Mau xe yeu thich",
          ],
          0
        ),
      ],
    },
    {
      moduleId: modules.laborLeave.id,
      slug: "demo-in-review-tu-ai-draft",
      title: "Demo lesson dang review tu AI draft",
      content:
        "Lesson nay o trang thai IN_REVIEW va inactive de demo quy trinh Admin CMS. Reviewer co the sua noi dung, them quiz, gan video roi publish.",
      sourceTitle: "Demo internal source",
      sourceUrl: "https://lexi.local/demo-source",
      legalDocumentNo: "DEMO-REVIEW",
      effectiveDate: new Date("2026-05-01T00:00:00.000Z"),
      reviewerNote: "Use this item to demo final review before publish.",
      sortOrder: 99,
      reviewStatus: LessonReviewStatus.IN_REVIEW,
      isActive: false,
      questions: [
        quiz(
          "Lesson IN_REVIEW co hien tren app learner khong?",
          "Learner app chi lay lesson active va PUBLISHED.",
          ["Co", "Khong", "Chi hien tren leaderboard", "Chi hien khi logout"],
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
      title: "Trich dieu ve nghi hang nam",
      sourceUrl: "https://lexi.local/sources/nghi-hang-nam",
      legalDocumentNo: "45/2019/QH14",
      effectiveDate: new Date("2021-01-01T00:00:00.000Z"),
      crawlStatus: LegalSourceCrawlStatus.CRAWLED,
      rawText:
        "Nguoi lao dong lam viec du 12 thang cho mot nguoi su dung lao dong thi duoc nghi hang nam, huong nguyen luong theo hop dong lao dong.",
    }),
    trafficFine: await upsertSource({
      title: "Xu phat khong mang giay phep lai xe",
      sourceUrl: "https://lexi.local/sources/khong-mang-gplx",
      legalDocumentNo: "100/2019/ND-CP",
      effectiveDate: new Date("2020-01-01T00:00:00.000Z"),
      crawlStatus: LegalSourceCrawlStatus.CRAWLED,
      rawText:
        "Nguoi dieu khien phuong tien can mang theo giay phep lai xe, dang ky xe va cac giay to lien quan khi tham gia giao thong.",
    }),
    pending: await upsertSource({
      title: "Nguon dang cho crawl - bao hanh hang dien tu",
      sourceUrl: "https://lexi.local/sources/pending-warranty",
      legalDocumentNo: "PENDING-DEMO",
      effectiveDate: new Date("2026-05-01T00:00:00.000Z"),
      crawlStatus: LegalSourceCrawlStatus.PENDING,
      rawText: "Placeholder source waiting for crawler.",
    }),
    failed: await upsertSource({
      title: "Nguon loi crawl - link het han",
      sourceUrl: "https://lexi.local/sources/failed-expired-link",
      legalDocumentNo: "FAILED-DEMO",
      effectiveDate: new Date("2026-05-01T00:00:00.000Z"),
      crawlStatus: LegalSourceCrawlStatus.FAILED,
      rawText: "Crawler could not fetch this source in demo mode.",
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
    title: "Can mang giay phep lai xe khi ra duong?",
    sourceDocumentId: sources.trafficFine.id,
    generationJobId: trafficJob.id,
    moduleId: content.modules.trafficBasics.id,
    status: LessonDraftStatus.ACCEPTED,
    content:
      "Khi dieu khien xe, nguoi lai can mang theo giay phep lai xe phu hop, dang ky xe va cac giay to bat buoc. Neu khong xuat trinh duoc khi bi kiem tra, co the bi xu phat theo quy dinh.",
    reviewerNote: "Draft da duyet, san sang demo nut Tao lesson.",
    videoScript:
      "Canh 1: nguoi lai xe bi dung kiem tra. Canh 2: checklist giay to can mang. Canh 3: loi khuyen luu ban sao thong tin.",
    videoPrompt:
      "Short friendly explainer video about carrying driving documents in Vietnam.",
    questions: [
      quiz(
        "Khi tham gia giao thong, giay to nao thuong can mang?",
        "Nguoi lai can co giay phep lai xe phu hop va giay to xe lien quan.",
        [
          "Giay phep lai xe",
          "The thanh vien sieu thi",
          "Hoa don an trua",
          "Mat khau email",
        ],
        0
      ),
      quiz(
        "Draft ACCEPTED trong admin co the lam gi tiep?",
        "Sprint 13 cho phep tao lesson IN_REVIEW tu draft ACCEPTED.",
        [
          "Tao lesson",
          "Tu dong publish",
          "Xoa backend",
          "Khoa tai khoan learner",
        ],
        0
      ),
    ],
  });

  await upsertDraft({
    title: "Quyen nghi phep nam cho nhan vien moi",
    sourceDocumentId: sources.laborLeave.id,
    generationJobId: laborJob.id,
    moduleId: content.modules.laborLeave.id,
    status: LessonDraftStatus.IN_REVIEW,
    content:
      "Nhan vien can hieu cach tinh nghi phep nam, dieu kien huong luong va cach trao doi voi cong ty khi chua lam du 12 thang.",
    reviewerNote: "Can reviewer bo sung vi du tinh ngay nghi theo thang.",
    videoScript: "Nhan vat hoi HR ve ngay nghi phep con lai.",
    videoPrompt: "Office explainer scene about annual leave balance.",
    questions: [
      quiz(
        "Lesson draft IN_REVIEW co tao lesson duoc ngay khong?",
        "Endpoint chi cho convert draft co status ACCEPTED.",
        ["Co", "Khong", "Chi khi la REJECTED", "Chi khi khong co source"],
        1
      ),
    ],
  });

  await upsertDraft({
    title: "Draft bi tu choi - link khuyen mai gia mao",
    sourceDocumentId: sources.failed.id,
    generationJobId: laborJob.id,
    moduleId: content.modules.antiScam.id,
    status: LessonDraftStatus.REJECTED,
    content:
      "Ban nhap nay bi tu choi vi nguon crawl khong dang tin cay va can kiem chung them.",
    reviewerNote: "Rejected demo item for filter and status UI.",
    videoScript: null,
    videoPrompt: null,
    questions: [
      quiz(
        "Draft REJECTED co nen publish khong?",
        "Draft bi tu choi can sua hoac tao lai tu nguon tin cay.",
        ["Co ngay", "Khong", "Tu dong publish", "Gan video la xong"],
        1
      ),
    ],
  });

  const convertedLesson = content.lessons["demo-in-review-tu-ai-draft"];
  await upsertDraft({
    title: "Draft da convert - nghi phep nam",
    sourceDocumentId: sources.laborLeave.id,
    generationJobId: laborJob.id,
    moduleId: content.modules.laborLeave.id,
    createdLessonId: convertedLesson.id,
    status: LessonDraftStatus.ACCEPTED,
    content: convertedLesson.content ?? "Converted draft demo.",
    reviewerNote: "Draft nay da tao lesson, UI se disable nut Tao lesson.",
    videoScript: "Converted draft script.",
    videoPrompt: "Converted draft video prompt.",
    questions: [
      quiz(
        "Draft da co createdLessonId co convert lai duoc khong?",
        "Backend chan convert trung mot draft.",
        ["Co", "Khong", "Chi admin moi duoc", "Neu doi slug"],
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
      "Create a 30-second vertical explainer about carrying driving documents.",
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
    title: "READY video - thoi gian thu viec",
    lessonId: content.lessons["thu-viec-toi-da-bao-lau"].id,
    sourceType: MediaAssetSourceType.EXTERNAL_URL,
    status: MediaAssetStatus.READY,
    url: videoUrl,
    mimeType: "video/mp4",
    provider: "external-url",
    renderPrompt: null,
  });

  await upsertMediaAsset({
    title: "READY video co the attach",
    sourceType: MediaAssetSourceType.EXTERNAL_URL,
    status: MediaAssetStatus.READY,
    url: videoUrl,
    mimeType: "video/mp4",
    provider: "external-url",
    renderPrompt: null,
  });

  await upsertMediaAsset({
    title: "Render request dang xu ly",
    sourceType: MediaAssetSourceType.RENDER_REQUEST,
    status: MediaAssetStatus.RENDERING,
    provider: "demo-renderer",
    renderPrompt:
      "Generate a simple animated legal explainer about annual leave rights.",
  });

  await upsertMediaAsset({
    title: "Render failed can retry",
    sourceType: MediaAssetSourceType.RENDER_REQUEST,
    status: MediaAssetStatus.FAILED,
    provider: "demo-renderer",
    renderPrompt: "This failed demo asset is used for admin status filters.",
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
      title: "Bai hoc dau tien",
      description: "Hoan thanh bai hoc dau tien.",
      iconName: "school",
      criteriaType: BadgeCriteriaType.FIRST_LESSON,
      sortOrder: 1,
    },
    {
      code: "three_lessons",
      title: "Khoi dau deu dan",
      description: "Hoan thanh 3 bai hoc khac nhau.",
      iconName: "auto_stories",
      criteriaType: BadgeCriteriaType.THREE_LESSONS,
      sortOrder: 2,
    },
    {
      code: "perfect_score",
      title: "Diem tuyet doi",
      description: "Dat 100% trong mot bai quiz.",
      iconName: "verified",
      criteriaType: BadgeCriteriaType.PERFECT_SCORE,
      sortOrder: 3,
    },
    {
      code: "five_attempts",
      title: "Thoi quen luyen tap",
      description: "Hoan thanh 5 luot lam quiz.",
      iconName: "repeat",
      criteriaType: BadgeCriteriaType.FIVE_ATTEMPTS,
      sortOrder: 4,
    },
    {
      code: "seven_day_streak",
      title: "Chuoi 7 ngay",
      description: "Hoc trong 7 ngay lien tiep.",
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
      title: "Hoan thanh bai hoc hom nay",
      description: "Hoan thanh 3 bai hoc khac nhau de nhan XP thuong.",
      type: DailyChallengeType.COMPLETE_LESSONS,
      target: 3,
      rewardXp: 20,
      sortOrder: 1,
      isActive: true,
    },
    create: {
      code: "complete_lessons_daily",
      title: "Hoan thanh bai hoc hom nay",
      description: "Hoan thanh 3 bai hoc khac nhau de nhan XP thuong.",
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
    title: "Den gio hoc LEXI",
    body: "Hoan thanh 3 bai de nhan XP hom nay.",
    successCount: 1,
    failureCount: 0,
    deliveredAt: new Date(),
  });

  await upsertDeliveryLog({
    userId: users.demo.id,
    type: NotificationDeliveryType.REVIEW_REMINDER,
    deliveryKey: "demo-review-reminder",
    status: NotificationDeliveryStatus.PARTIAL,
    title: "On lai cau da sai",
    body: "Ban co cau hoi ve nghi viec va phishing can xem lai.",
    successCount: 1,
    failureCount: 1,
    deliveredAt: new Date(),
  });

  await upsertDeliveryLog({
    userId: users.leaderboardUsers[0].id,
    type: NotificationDeliveryType.STREAK_REMINDER,
    deliveryKey: "demo-streak-reminder",
    status: NotificationDeliveryStatus.FAILED,
    title: "Giu chuoi hoc tap",
    body: "Demo failed delivery log for admin filters.",
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
