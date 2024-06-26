import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// Third party
import { useQuery } from "@tanstack/react-query";

// Controller
import { defaultOrder } from "./ProjectsContext.controller.js";

// Custom
import { getRepoData } from "../http/getRepoData.js";
import extractErrorMessage from "../utils/extractErrorMessage.js";
import backupData from "../data/backup-data.json";

export const ProjectsContext = createContext();

const ProjectsContextProvider = ({ children }) => {
  const [repos, setRepos] = useState(undefined);
  const [selectedProject, setSelectedProject] = useState(null);
  const [featuredTopics, setFeaturedTopics] = useState(new Set());
  const taggedRepos = useMemo(() => {
    if (!repos) {
      return;
    }

    return repos.map((repo) => {
      const { topics } = repo;

      return {
        ...repo,
        isFeatured:
          featuredTopics.size === 0
            ? true
            : topics.some((topic) => featuredTopics.has(topic)),
      };
    });
  }, [repos, featuredTopics]);

  const { data, isError } = useQuery({
    queryKey: ["repos"],
    queryFn: getRepoData,
    onError: (err) => console.error(extractErrorMessage(err)),
    cacheTime: 300_000,
    staleTime: 240_000,
    retry: false,
  });

  const updateFeaturedTopics = useCallback(
    (selectedTopic) => {
      const topicsCopy = featuredTopics
        ? new Set([...featuredTopics])
        : undefined;

      if (!topicsCopy) {
        return;
      }

      if (topicsCopy.has(selectedTopic)) {
        topicsCopy.delete(selectedTopic);
      } else {
        topicsCopy.add(selectedTopic);
      }

      setFeaturedTopics(topicsCopy);
    },
    [featuredTopics]
  );

  useEffect(() => {
    if (data) {
      const orderedProjects = defaultOrder(data);

      setRepos(orderedProjects);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      setRepos(backupData);
    }
  }, [isError]);

  return (
    <ProjectsContext.Provider
      value={{
        repos: taggedRepos,
        updateFeaturedTopics,
        selectedProject,
        setSelectedProject,
        featuredTopics,
        isError,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export default ProjectsContextProvider;
