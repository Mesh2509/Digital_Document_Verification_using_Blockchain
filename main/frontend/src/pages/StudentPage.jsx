import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useMetaMaskContext } from '../context/MetaMaskContext';
import axios from 'axios';
import MiniStatistics from '../components/card/MiniStatistics';
import IconBox from '../components/icons/IconBox';
import { Box, Button, Card, Checkbox, CheckboxGroup, Flex, Icon, IconButton, Input, Select, SimpleGrid, Stack, useCheckboxGroup, useColorModeValue } from '@chakra-ui/react';
import { FaRegAddressBook } from "react-icons/fa";
import { useDropzone } from 'react-dropzone';
import { Text } from '@chakra-ui/react';

import { useMemo } from 'react';


import {
  MdAddTask,
  MdAttachMoney,
  MdBarChart,
  MdFileCopy,
} from "react-icons/md";


import { FaBuilding } from "react-icons/fa";
import { MdCheckBox, MdDragIndicator } from "react-icons/md";
import { MdUpload } from "react-icons/md";

import { MdCheckCircle, MdCancel, MdOutlineError } from "react-icons/md";
import { TabelCard } from '../mainComponents/TabelCard';
import TransactionCard from '../mainComponents/TransactionCard';
import CompanyManage from '../mainComponents/CompanyManage';
import FileUpload from '../mainComponents/FileUpload';


import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { IoMdCloseCircle } from "react-icons/io";
import playToastSound from '../mainComponents/ToastSound';

function StudentPage() {
  const [file, setFile] = useState(null);


  const [uuid, setUUID] = useState(null);  //selected document//
  const [ipfsData, setIpfsData] = useState(null);  //response from IPFS server//

  const { contract, account } = useMetaMaskContext();


  const [universityAddresses, setUniversityAddresses] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(''); // State for selected university address

  const [companyAddresses, setCompanyAddresses] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(''); // State for selected company address

  const [studentDocumentlist, setStudentDocumentlist] = useState([]); // State for selected company address
  const [DocumentCompanylist, setDocumentCompanylist] = useState([]); // State for selected company address

  const [DocumentDetails, setDocumentDetails] = useState([]); // State for selected company address

  const [Transaction, setTransaction] = useState();



  const cardbg = useColorModeValue('#ffffff', 'navy.800');
  const brandColor = useColorModeValue("brand", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const bg = useColorModeValue("gray.100", "navy.700");
  const borderColor = useColorModeValue("secondaryGray.100", "whiteAlpha.100");
  const uploadColor = useColorModeValue("brand.500", "white");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const iconColor = useColorModeValue("secondaryGray.500", "white");





  const handleUpload = async () => {



    setIpfsData(null);
    setTransaction(null);

    const formData = new FormData();
    formData.append('certificate', file);



    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });



      const data = response.data;   //ifpsLink//cid//uuid//
      setIpfsData(data);
      console.log("IPFS server response", data);

      uploadDocument(data.uuid, data.cid, selectedUniversity);

    } catch (error) {
      console.error(error);
      toast.error('Error uploading document', {
        icon:IoMdCloseCircle,
        onOpen: () => {
            playToastSound(); // Play the sound when the toast opens
          },
      });
    }


  };

  // Define your document upload function
  async function uploadDocument(uniqueId, ipfsHash, universityAddress) {
    try {


      // Call the smart contract function
      const transaction = await contract.uploadDocument(uniqueId, ipfsHash, universityAddress, { from: account });
      await transaction.wait();
      console.log('Document uploaded successfully:', transaction);
      setTransaction(transaction);
      await getStudentDocumentList();
      setDocumentDetails([]);

      toast.success(' Document uploaded Successfully', {
        icon:MdFileCopy,
        onOpen: () => {
            playToastSound(); // Play the sound when the toast opens
          },
      });
    } catch (error) {

      console.error('Error uploading document:', error.reason);
      toast.error('Error uploading document', {
        icon:IoMdCloseCircle,
        onOpen: () => {
            playToastSound(); // Play the sound when the toast opens
          },
      });
      // Handle the error here
    }
  }

  // Function to handle dropdown selection
  const handleUniversityChange = (event) => {
    setSelectedUniversity(event.target.value);
  };
  // Function to fetch university addresses from the smart contract
  const fetchUniversityAddresses = async () => {
    try {
      const transaction = await contract.getAllUniversityAddresses({ from: account });

      console.log('Response from getuniversity:', transaction); // Log the response
      const uniqueAddressesSet = new Set(transaction);
      // Convert the Set back to an array.
      const uniqueAddressesArray = [...uniqueAddressesSet];
      setUniversityAddresses(uniqueAddressesArray);
    } catch (error) {
      console.error('Error fetching university addresses:', error.reason);
    }
  };



  useEffect(() => {
    // Check if contract is not null
    if (contract !== null) {
      fetchUniversityAddresses();
      fetchCompanyAddresses();
      setDocumentDetails([]);
      getStudentDocumentList();

    }
  }, [account]); // Add contract as a dependency

  // Function to handle dropdown selection
  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };
  // Function to fetch company addresses from the smart contract
  const fetchCompanyAddresses = async () => {
    try {
      const transaction = await contract.getAllCompanyAddresses({ from: account });
      console.log('Response from getcompanies:', transaction); // Log the response
      const uniqueAddressesSet = new Set(transaction);
      // Convert the Set back to an array.
      const uniqueAddressesArray = [...uniqueAddressesSet];
      setCompanyAddresses(uniqueAddressesArray);
    } catch (error) {
      console.error('Error fetching Company addresses:', error.reason);
    }
  };

  async function includeCompany() {
    try {

      setIpfsData(null);
      setTransaction(null);
      // Call the smart contract function
      const transaction = await contract.includeCompany(uuid, selectedCompany, { from: account });
      await transaction.wait();
      getDocumentCompanyList(uuid);
      console.log('Company included successfully:', transaction);
      setTransaction(transaction);

      toast.success('Company included Successfully', {
        icon:FaBuilding,
        onOpen: () => {
            playToastSound(); // Play the sound when the toast opens
          },
      });
      
    } catch (error) {
      console.error('Error including company:', error.reason);
      toast.error('Error including company', {
        icon:IoMdCloseCircle,
        onOpen: () => {
            playToastSound(); // Play the sound when the toast opens
          },
      });
      // Handle the error here
    }
  }
  async function removeCompany() {
    try {

      setIpfsData(null);
      setTransaction(null);

      // Call the smart contract function
      const transaction = await contract.removeCompany(uuid, selectedCompany, { from: account });
      await transaction.wait();
      getDocumentCompanyList(uuid);
      console.log('Company removed successfully:', transaction);
      setTransaction(transaction);

      toast.success('Company removed Successfully', {
        icon:FaBuilding,
        onOpen: () => {
            playToastSound(); // Play the sound when the toast opens
          },
      });

    } catch (error) {
      console.error('Error removing company:', error.reason);
      toast.error('Error removing company', {
        icon:IoMdCloseCircle,
        onOpen: () => {
            playToastSound(); // Play the sound when the toast opens
          },
      });
      // Handle the error here
    }
  }

  const handleDocumentChange = (event) => {
    setUUID(event.target.value);
    getDocumentCompanyList(event.target.value);
  };


  const getStudentDocumentList = async () => {
    try {
      const transaction = await contract.getStudentDocumentList({ from: account });
      console.log('Response getStudentDocumentList:', transaction); // Log the response

      setStudentDocumentlist(transaction);

    } catch (error) {
      console.error('Error fetching documents:', error.reason);
    }
  };

  const getDocumentCompanyList = async (uuid) => {
    try {
      if (!uuid) {
        setDocumentCompanylist([]);
        return;
      };
      const transaction = await contract.getDocumentCompanyList(uuid, { from: account });
      console.log('Response getDocumentCompanyList:', transaction); // Log the response

      setDocumentCompanylist(transaction);
    } catch (error) {
      console.error('Error fetching DocumentCompanyList:', error.reason);
    }
  };

  useEffect(() => {
    setDocumentDetails([]);
    const fetchData = async () => {
      const collectedData = [];
      for (const uuid of studentDocumentlist) {
        const data = await getDocumentDetails(uuid);
        collectedData.push(data);
      }
      setDocumentDetails(collectedData);
    };

    fetchData();
  }, [studentDocumentlist]);

  const getDocumentDetails = async (uuid) => {
    try {
      if (!uuid) {

        return;
      };
      const transaction = await contract.getDocumentDetails(uuid, { from: account });
      const arr = [].concat(...transaction);
      arr.push(uuid);
      arr.splice(2, 1);
      [arr[0], arr[1], arr[2], arr[3]] = [arr[3], arr[2], arr[0], arr[1]];

      console.log('Response getDocumentDetails:', arr);
      return arr;
    } catch (error) {
      console.error('Error fetching DocumentCompanyList:', error.reason);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {

    setFile(acceptedFiles[0]);

  }, []);






  return (
    <Box>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 2, "2xl": 6 }}
        gap='20px'
        mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox
              w='40px'
              h='40px'
              bg={boxBg}
              icon={
                <Icon w='20px' h='20px' as={FaRegAddressBook} color={uploadColor} />
              }
            />
          }
          name='Account'
          value={account}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='40px'
              h='40px'
              bg={boxBg}
              icon={
                <Icon w='20px' h='20px' as={MdFileCopy} color={uploadColor} />
              }
            />
          }
          name='Total Documents'
          value={studentDocumentlist.length}
        />


      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>

        {/* FileUpload component */}
        <FileUpload
          onDrop={onDrop} file={file}
          heading={"Upload Document"}
          selectLabel={"Select University"}
          handleSelectChange={handleUniversityChange}
          selectedValue={selectedUniversity}
          selectList={universityAddresses}
          handleBtn1={handleUpload}
          btn1Text={"Upload"}
        />



        <TransactionCard uuid={uuid} Transaction={Transaction} ipfsData={ipfsData} />

      </SimpleGrid>



      <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
        {/* add or remove company */}
        <CompanyManage
          handleDocumentChange={handleDocumentChange}
          uuid={uuid}
          Documentlist={studentDocumentlist}
          handleCompanyChange={handleCompanyChange}
          selectedCompany={selectedCompany}
          companyAddresses={companyAddresses}
          includeCompany={includeCompany}
          removeCompany={removeCompany}
        />



        {/* Document Companies List */}
          <TabelCard data={[DocumentCompanylist]} headers={["S.N", "Companies"]} 
          heading={"Document Companies List"} searchId={0} searchLabel={"Search Company"} />

      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px'>
        {/* Student Document List */}
       
          <TabelCard data={DocumentDetails} headers={["S.N", "Document", "University", "IPFS CID", "Verified"]} 
           heading={"Student Document List"} searchId={1} searchLabel={"Search Document"}
          />


      </SimpleGrid>


















    </Box>
  );
}

export default StudentPage;
