import { CreateProjectDocument, CreateProjectMutation, CreateProjectMutationVariables, Member, Project, Skill } from "@/gql/graphql";
import { useEffect, useState } from "react";
import SkillSearchInput from "./SkillSearchInput";
import ProjectManagerSearchInput from "./ProjectManagerSearchInput";
import { SERVER } from "@/lib/env";
import { OperationResult, useMutation } from "urql";
import { toast } from "react-toastify";

interface Props {
  setModal: any;
  modal: boolean;
  skills: Skill[];
  members: Member[];
  allProjects: Project[];
  setAllProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  filteredProjects: Project[];
  setFilteredProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}
export default function CreateProject(props: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const { setModal, modal } = props;
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const selectedSkillsIds = selectedSkills.map((skill) => skill.id);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [duration, setDuration] = useState<Date | string | undefined>();
  const [selectedProjectManager, setSelectedProjectManager] =
    useState<Member>(Object);
  const [projectManagers, setProjectManagers] = useState<Member[]>(Array);

  const [state, CreateProjectExecute] = useMutation(CreateProjectDocument);

  const HandleSubmit = async () => {
    const savedProject: OperationResult<CreateProjectMutation, CreateProjectMutationVariables> = await CreateProjectExecute({
      skillsIds: selectedSkillsIds as number[],
      description: description,
      title: title,
      managerId: selectedProjectManager?.id as number,
      duration: 0,
    });


    let res;
    
    let newProject : Project = savedProject?.data?.createProject as Project;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id", savedProject.data?.createProject?.id+'');


      // upload image to server using axios
      res = await fetch(
        `${SERVER}project/upload/`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log(await res.json());
    }



    if (savedProject.data?.createProject) {
      toast.success("Project Added Successfully");
      newProject.skillProject = [];
      newProject?.skillProject.map((skillProject) => {
        skillProject.skill = selectedSkills.find((skill) => skill.id === skillProject.skill?.id);
      }
      );

      
      // set image url to saved Project
      // newProject.avatarId = await res?.json().then((data) => data?.avatarId);

      props.setAllProjects([...props.allProjects, newProject]);
      props.setFilteredProjects([...props.filteredProjects, newProject]);
      setModal(false);
      setSelectedSkills([]);
      setSkills([]);
      setDuration(undefined);
      setSelectedProjectManager(Object);
      setProjectManagers([]);
      setTitle("");
      setDescription("");
      setFile(null);


    } else {
      savedProject.error?.message.split("]")[1].startsWith(" target") ? toast.error("server error") : toast.error(savedProject.error?.message.split("]")[1]);
    }
  };

  return (
    <>
      {modal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-sticky outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl md:min-w-120">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none h-[95vh] overflow-y-auto">
                {/*header*/}
                <div className="flex items-start justify-between px-5 py-2 border-blueGray-200 rounded-t border-b border-solid">
                  <h3 className="text-xl font-bold">Create Project</h3>
                  <button
                    onClick={() => setModal(false)}
                    type="button"
                    data-toggle="modal"
                    data-target="#import"
                    className="fa fa-close w-4 h-4 ml-auto box-content p-2 text-black dark:text-white border-0 rounded-1.5 opacity-50 cursor-pointer -m-2 "
                    data-dismiss="modal"
                  />
                </div>
                {/*body*/}
                <form encType="multipart/form-data" 
                  onSubmit={(e) => {
                    e.preventDefault();
                    HandleSubmit();
                  }
                  }

                >
                  <div className="relative px-6 py-1 flex-auto">
                    <p className="-mb-1 ml-1 text-sm font-bold">Image</p>
                    <input
                      className="focus:shadow-soft-primary-outline text-sm leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none "
                      type="file"
                      required 
                      onChange={(e) =>  setFile(e?.target?.files ? e?.target?.files[0] : null)}

                       />
                  </div>
                  <div className="relative px-6 py-1 flex-auto">
                    <p className="-mb-1 ml-1 text-sm font-bold">Title</p>
                    <input
                      type="text"
                      placeholder="Enter your Title"
                      onChange={(e) => setTitle(e.target.value)}
                      value={title}
                      className="focus:shadow-soft-primary-outline text-sm leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none"
                    />
                  </div>
                  <div className="relative px-6 py-1 flex-auto">
                    <p className="-mb-1 ml-1 text-sm font-bold">Description</p>
                    <input
                      onChange={(e) => setDescription(e.target.value)}
                      value={description}
                      type="text"
                      placeholder="Enter your Description"
                      className="focus:shadow-soft-primary-outline text-sm leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none"
                    />
                  </div>
                  <ProjectManagerSearchInput
                    projectManagerData={props.members}
                    selectedProjectManager={selectedProjectManager}
                    setSelectedProjectManager={setSelectedProjectManager}
                    projectManagers={projectManagers}
                    setProjectManagers={setProjectManagers}
                  />
                  <SkillSearchInput
                    skillData={props.skills}
                    selectedSkills={selectedSkills}
                    setSelectedSkills={setSelectedSkills}
                    skills={skills}
                    setSkills={setSkills}
                    selectedSkillsIds={selectedSkillsIds}
                    className="px-6 py-3"
                  />
                  <div className="relative px-6 py-1 flex-auto">
                    <p className="-mb-1 ml-1 text-sm font-bold">Duration</p>
                    <input
                      type="datetime-local"
                      value={!Number.isNaN(new Date(duration as string).getTime()) ? (duration as Date).toISOString()?.slice(0, 16) : ""}
                      onChange={(e) => setDuration(new Date(e.target.value))}
                      placeholder="Enter your Duration"
                      className="focus:shadow-soft-primary-outline text-sm leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none"
                    />
                  </div>
                  {/*footer*/}
                  <div className="flex items-center justify-end px-6 py-1 border-t border-solid border-blueGray-200 rounded-b">
                    <button
                      onClick={() => setModal(false)}
                      type="button"
                      data-toggle="modal"
                      data-target="#import"
                      className="inline-block px-8 py-2 m-1 mb-4 text-xs font-bold text-center text-white uppercase align-middle transition-all border-0 rounded-lg cursor-pointer ease-soft-in leading-pro tracking-tight-soft bg-gradient-to-tl from-slate-600 to-slate-300 shadow-soft-md bg-150 bg-x-25 hover:scale-102 active:opacity-85"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      data-toggle="modal"
                      data-target="#import"
                      className="inline-block px-8 py-2 m-1 mb-4 text-xs font-bold text-center text-white uppercase align-middle transition-all border-0 rounded-lg cursor-pointer ease-soft-in leading-pro tracking-tight-soft bg-gradient-to-tl from-purple-700 to-pink-500 shadow-soft-md bg-150 bg-x-25 hover:scale-102 active:opacity-85"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}
