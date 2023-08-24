import Categories from "@/app/components/Categories";
import Posts from "@/app/components/Posts";
import PostsCarousel from "@/app/components/PostsCarousel";
import { PostMetaData } from "@/types";
import { getListFromFolder } from "@/utils";

function fetchData() {
  return getListFromFolder<PostMetaData>("__posts");
}

export default function index() {
  const posts = fetchData();
  const featuredPosts = posts.filter((post) => post.featured);

  return (
    <div className="flex">
      <aside className="hidden relative mt-14 pl-16 basis-1/4 md:block">
        <div className="sticky top-10 w-60">
          <Categories
            title="Categories"
            list={[
              "Next.js",
              "Error report",
              "React",
              "내부 동작원리 파헤치기",
            ]}
          />
        </div>
      </aside>

      <main className="px-8 flex flex-col gap-y-40 max-w-lg md:max-w-5xl w-full">
        <PostsCarousel
          title="추천 글"
          // TODO: 전체 추천 글 데이터로 교체
          posts={[...featuredPosts, ...featuredPosts, ...featuredPosts]}
        />
        {/* TODO: category 선택 기능 추가 */}
        <Posts
          title="전체 글 보기"
          posts={[...posts, ...posts, ...posts, ...posts]}
        />
      </main>
    </div>
  );
}
