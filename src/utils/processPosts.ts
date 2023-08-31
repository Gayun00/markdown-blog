import fs from "fs";
import matter from "gray-matter";
import path from "path";

import { PostData, SeriesData, SeriesDataWithTitle } from "@/types";
import { cache } from "react";

const rootDirPath = path.join(process.cwd(), "__posts");

export const getAllPosts = cache(() => {
  const rootDir = fs.readdirSync(rootDirPath);
  const posts = rootDir.reduce((acc: PostData[], series: string) => {
    const postDirList = getPostDirListOfSeries(series);
    const seriesPosts = postDirList.map((postName) =>
      getPostContent(series, postName)
    );
    return [...acc, ...seriesPosts];
  }, []);

  return posts.sort((a, b) => a.title.localeCompare(b.title));
});

export const getFeaturedPosts = () => {
  return getAllPosts().filter((post) => !!post.featured);
};

export const getRelatedPosts = cache((currentPostTitle: string) => {
  const posts = getAllPosts();
  const currentPostIdx = posts.findIndex(
    (post) => post.title === currentPostTitle
  );

  return [posts[currentPostIdx - 1], posts[currentPostIdx + 1]];
});

export const getSeries = cache((): Promise<SeriesDataWithTitle[]> => {
  return new Promise((resolve) => {
    const result: SeriesDataWithTitle[] = [];
    fs.readdir(rootDirPath, (_, folders) => {
      const promises = folders.map((folderName) => {
        const seriesPath = path.join(rootDirPath, folderName);
        const seriesDataPath = path.join(seriesPath, "data.md");

        return getSeriesData(seriesDataPath).then((data) => {
          const seriesData = {
            title: folderName,
            ...data,
          };
          result.push(seriesData);
        });
      });

      Promise.all(promises).then(() => {
        resolve(result.sort((a, b) => a.title.localeCompare(b.title)));
      });
    });
  });
});

const getSeriesData = cache((dataPath: string): Promise<SeriesData> => {
  return new Promise((resolve) => {
    fs.readFile(dataPath, "utf8", (err, mdContent) => {
      const { data } = matter(mdContent);
      resolve({
        description: data.description,
        thumbnail: data.thumbnail,
      });
    });
  });
});

export const getPostsOfSeries = cache((series: string): PostData[] => {
  const postDirList = getPostDirListOfSeries(series);
  const posts = postDirList.map((postDir) => getPostContent(series, postDir));

  return posts;
});

export const getPost = cache((title: string): PostData => {
  const posts = getAllPosts();
  const matchedPost = posts.find((post) => post.title === title);
  if (!matchedPost) {
    throw new Error("no matched post");
  }
  return matchedPost;
});

const getPostDirListOfSeries = (series: string) => {
  const seriesDirPath = path.join(rootDirPath, series);
  const seriesDirList = fs.readdirSync(seriesDirPath);
  const postDirList = seriesDirList.filter(
    (seriesDir) => seriesDir !== "data.md"
  );
  return postDirList;
};

const getPostContent = (series: string, postDir: string) => {
  const seriesDirPath = path.join(rootDirPath, series);
  const filePath = path.join(seriesDirPath, postDir);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const postData = {
    ...data,
    content,
    series,
    title: postDir.replace(".md", ""),
  };
  return postData as PostData;
};
