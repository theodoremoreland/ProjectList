// React
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";

// Bootstrap
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";

// Icons
import { BsList } from "react-icons/bs";

// Controller
import {
  createWordCloudData,
  sortProjects,
  filterProjects,
} from "./Timeline.controller.js";

// Custom Components
import Project from "./Project/Project";
import Filter from "./Filter/Filter";
import SortButtonGroup from "./SortButtonGroup/SortButtonGroup";

import octocatIcon from "../../images/Octocat.png";
import linkedInIcon from "../../images/LI-In-Bug.png";

// Custom styles
import "./Timeline.css";

const filterLabels = ["Competencies", "Languages", "Frameworks", "Tools"];

const sortOptions = ["default", "date_created", "date_updated"];

// Converts appearance of sort option for Front-end
// Implementation varies by screen size
const optionTransmuter = {
  default: "Default",
  date_created: "Date Created",
  date_updated: "Date Updated",
};

const createWordCloudsAreOpenObject = () => {
  const wordCloudsAreOpenObject = {};

  for (const label of filterLabels) {
    wordCloudsAreOpenObject[label] = false;
  }

  return wordCloudsAreOpenObject;
};

export default function Timeline(props) {
  const { projects } = props;
  const [sortedAndFilteredProjects, setSortedAndFilteredProjects] =
    useState(projects);
  const [filtersCurrentlyInUse, setFiltersCurrentlyInUse] = useState([]);
  // the below useMemo uses projects as a dep, but projects should never change and thus memo prevents unnecessary rerender.
  const wordCloudData = useMemo(
    () => createWordCloudData(projects),
    [projects]
  );
  const [wordCloudsAreOpenObject, setWordCloudsAreOpenObject] = useState(
    createWordCloudsAreOpenObject
  );
  const [sortValue, setSortValue] = useState({
    name: sortOptions[0],
    direction: "",
  });
  const [modalIsVisible, setModalIsVisible] = useState();
  const scrollContainerRef = useRef(); // used to sync horizontal scroll with mouse wheel

  /** Wrapped in useCallback as to enable removing from event listener
   * when component re-renders and/or unmounts.
   */
  const syncScrollWithWheel = useCallback((event) => {
    const readMe = document.querySelector(".readme");
    const isMobile = window.innerWidth < 769;

    if (scrollContainerRef.current && !readMe && !isMobile) {
      scrollContainerRef.current.scrollLeft += event.deltaY;
    }
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      document.addEventListener("wheel", syncScrollWithWheel);
    }

    return () => {
      document.removeEventListener("wheel", syncScrollWithWheel);
    };
  }, [scrollContainerRef, syncScrollWithWheel]);

  useEffect(() => {
    // filterProjects should use all projects as the argument due to current implementation
    setSortedAndFilteredProjects(
      filterProjects(projects, filtersCurrentlyInUse, wordCloudData, sortValue)
    );
    // eslint-disable-next-line
  }, [projects, filtersCurrentlyInUse, wordCloudData]); // ! DO NOT ADD sortValue to dependency array, this useEffect should not run when sortValue state changes!

  useEffect(() => {
    // sortProjects should use the current state of what's been sorted and filtered
    setSortedAndFilteredProjects(
      sortProjects(sortedAndFilteredProjects, sortValue)
    );
    // eslint-disable-next-line
  }, [sortValue]);

  return (
    <>
      <header className="timelineHeader">
        <h2 className="timelineTitle">Project List</h2>
        <span className="listIcon" onClick={() => setModalIsVisible(true)}>
          <BsList size="1.9em" />
        </span>
        <p className="timelineSubtitle">
          A dynamically generated list of my GitHub projects via GitHub API.
        </p>
      </header>
      <div className="filtersContainer">
        {filterLabels.map((label) => {
          return (
            <div
              key={`${label.toLowerCase()}FilterArea`}
              className="filterArea"
            >
              <Filter
                key={`${label.toLowerCase()}Filter`}
                label={label}
                wordCloudData={wordCloudData[label.toLowerCase()]}
                filtersCurrentlyInUse={filtersCurrentlyInUse}
                setFiltersCurrentlyInUse={setFiltersCurrentlyInUse}
                wordCloudsAreOpenObject={wordCloudsAreOpenObject}
                setWordCloudsAreOpenObject={setWordCloudsAreOpenObject}
              />
            </div>
          );
        })}
      </div>
      <div className="timeline">
        <div className="contact">
          <a
            href="https://github.com/theodoremoreland"
            rel="noopener noreferrer"
            target="_blank"
            title="My GitHub Profile"
          >
            <Image className="octocatIcon" src={octocatIcon} fluid />
          </a>
          <a
            href="https://www.linkedin.com/in/theodore-moreland/"
            rel="noopener noreferrer"
            target="_blank"
            title="My LinkedIn Profile"
          >
            <Image className="linkedInIcon" src={linkedInIcon} fluid />
          </a>
        </div>
        <div className="projectCardScrollContainer" ref={scrollContainerRef}>
          {sortedAndFilteredProjects.map((project) => (
            <Project key={project.name} projectData={project} />
          ))}
        </div>
      </div>
      <div className="sortButtonGroupContainer">
        <SortButtonGroup
          sortOptions={sortOptions}
          optionTransmuter={optionTransmuter}
          sortValue={sortValue}
          setSortValue={setSortValue}
        />
      </div>
      <Modal
        className="modal"
        show={modalIsVisible}
        onHide={() => setModalIsVisible(false)}
        animation={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {" "}
            {`${sortedAndFilteredProjects.length} results`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h2>Filter</h2>
          <div className="modalFiltersContainer">
            {filterLabels.map((label) => {
              return (
                <div key={`${label.toLowerCase()}FilterColumn`}>
                  <Filter
                    key={`${label.toLowerCase()}Filter`}
                    label={label}
                    wordCloudData={wordCloudData[label.toLowerCase()]}
                    filtersCurrentlyInUse={filtersCurrentlyInUse}
                    setFiltersCurrentlyInUse={setFiltersCurrentlyInUse}
                    wordCloudsAreOpenObject={wordCloudsAreOpenObject}
                    setWordCloudsAreOpenObject={setWordCloudsAreOpenObject}
                  />
                </div>
              );
            })}
          </div>
          <h2>Sort</h2>
          <div className="modalSortButtonGroupContainer">
            <SortButtonGroup
              sortOptions={sortOptions}
              optionTransmuter={optionTransmuter}
              sortValue={sortValue}
              setSortValue={setSortValue}
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
