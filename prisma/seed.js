// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// async function main() {
//   const posts = Array.from({ length: 50 }).map((_, i) => ({
//     slug: `dummy-post-${i + 50}`,
//     title: `더미 포스트 ${i + 50}`,
//     desc: `이것은 더미 포스트 ${i + 51}의 설명입니다. 내용을 길게 넣어 성능 영향을 관찰합니다.`,
//     img: [],
//     views: Math.floor(Math.random() * 1000),
//     isPublished: true,
//     catSlug: "Coding",
//     userEmail: "dojin0345@gmail.com",
//   }));

//   for (const post of posts) {
//     await prisma.post.create({ data: post });
//   }
// }

// main()
//   .catch((e) => console.error(e))
//   .finally(() => prisma.$disconnect());

// async function main() {
//   try {
//     const deletedPosts = await prisma.post.deleteMany({
//       where: {
//         isPublished: true,
//       },
//     });

//     console.log(
//       `"공개" 상태의 게시글 ${deletedPosts.count}개가 삭제되었습니다.`
//     );
//   } catch (error) {
//     console.error("게시글 삭제 중 오류 발생:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
