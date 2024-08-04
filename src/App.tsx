import {
  Button,
  Center,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/react";
import {
  getAllRecords,
  addRecord,
  deleteRecord,
  updateRecord,
} from "./lib/supabasefunctions";
import { useEffect, useState } from "react";
import { Record } from "./domain/study-record";
import { useForm, SubmitHandler } from "react-hook-form";

type formInputs = {
  title: string;
  time: string;
};

function App() {
  const [records, setRecords] = useState<Record[]>([]);
  const [nowLoading, setNowLoading] = useState(true);
  const [editRecord, setEditRecord] = useState<Record | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<formInputs>();

  useEffect(() => {
    const getRecords = async () => {
      setNowLoading(true);
      const records = await getAllRecords();
      setRecords(records);
      setNowLoading(false);
    };
    getRecords();
  }, []);

  const onClickModalOpen = () => {
    reset({ title: "", time: "" });
    onOpen();
  };
  const onClickAddRecord: SubmitHandler<formInputs> = async (data) => {
    await addRecord(data.title, data.time);
    let newRecords = await getAllRecords();
    setRecords(newRecords);
    reset({ title: "", time: "" });
    onClose();
  };

  const onClickDeleteRecord = async (id: number) => {
    await deleteRecord(id);
    let newRecords = await getAllRecords();
    setRecords(newRecords);
  };

  const onClickEditRecord = (record: Record) => {
    setEditRecord(record);
    setValue("title", record.title);
    setValue("time", record.time.toString());
    onOpen();
  };
  const onSubmitEditRecord: SubmitHandler<formInputs> = async (data) => {
    if (editRecord) {
      await updateRecord(editRecord.id, data.title, data.time);
      let updatedRecords = [...records];
      const index = updatedRecords.findIndex((r) => r.id === editRecord.id);
      if (index !== -1) {
        updatedRecords[index] = {
          ...editRecord,
          title: data.title,
          time: data.time,
        };
        setRecords(updatedRecords);
      }
      setEditRecord(null);
      onClose();
    }
  };

  const sumTime = records.reduce((total, rec) => total + Number(rec.time), 0);

  return (
    <>
      {/* ヘッダー */}
      <Text
        data-testid="isTitle"
        fontSize="5xl"
        align="center"
        bg="teal.300"
        color="white"
      >
        学習記録アプリ
      </Text>
      <Center>
        <Button
          data-testid="add-record-button"
          mt={10}
          mb={10}
          p={5}
          onClick={onClickModalOpen}
        >
          学習記録を登録する
        </Button>
      </Center>

      {/* 学習記録を入力するモーダルフォーム */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">
            {editRecord ? "学習記録を編集する" : "学習記録を登録する"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <form> */}
            <FormControl isInvalid={Boolean(errors.title)}>
              <FormLabel htmlFor="title">学習内容</FormLabel>
              <Input
                data-testid = "title-input"
                id="title"
                placeholder="学習内容を入力してください。"
                {...register("title", {
                  required: "⚠️学習内容は必須入力項目です。",
                })}
              />
              <FormErrorMessage>
                {errors.title && errors.title.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl mt={4} isInvalid={Boolean(errors.time)}>
              <FormLabel htmlFor="time">学習時間</FormLabel>
              <Input
                data-testid = "time-input"
                id="time"
                placeholder="学習時間を入力してください。"
                type="number"
                {...register("time", {
                  required: "⚠️学習時間は必須入力項目です。",
                  min: {
                    value: 1,
                    message: "⚠️学習時間は1以上である必要があります。",
                  },
                })}
              />
              <FormErrorMessage>
                {errors.time && errors.time.message}
              </FormErrorMessage>
            </FormControl>
            {/* </form> */}
          </ModalBody>
          <ModalFooter margin="auto">
            <Button
              data-testid="submit-button"
              colorScheme="green"
              mr={3}
              type="submit"
              onClick={
                editRecord
                  ? handleSubmit(onSubmitEditRecord)
                  : handleSubmit(onClickAddRecord)
              }
            >
              {editRecord ? "更新する" : "登録する"}
            </Button>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              戻る
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 学習記録を表示させるテーブル */}
      {nowLoading ? (
        <Center>
          <Spinner
            data-testid="loading-screen"
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
            mt={50}
          />
        </Center>
      ) : (
        <TableContainer data-testid="record-list" maxW="80%" margin="auto">
          <Text textAlign="center" mb={10} fontSize="xl" fontWeight="bold">
            現在の総学習時間: {sumTime}/1000(h)
          </Text>
          <Table>
            <Thead>
              <Tr>
                <Th fontWeight="bold" fontSize="lg">
                  タイトル
                </Th>
                <Th fontWeight="bold" fontSize="lg">
                  時間
                </Th>
                <Th></Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {records.map((record) => (
                <Tr key={record.id}>
                  <Td>{record.title}</Td>
                  <Td>{record.time}h</Td>
                  <Td>
                    <Button
                      data-testid="update-button"
                      color="white"
                      bgColor="green.500"
                      onClick={() => onClickEditRecord(record)}
                    >
                      編集
                    </Button>
                  </Td>
                  <Td>
                    <Button
                      data-testid = "delete-button"
                      color="white"
                      bgColor="red.500"
                      onClick={() => onClickDeleteRecord(record.id)}
                    >
                      削除
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

export default App;
