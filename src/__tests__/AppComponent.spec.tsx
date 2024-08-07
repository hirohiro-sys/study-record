import App from "../App";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockGetAllRecords = jest
  .fn()
  // 初期表示のテスト
  .mockResolvedValueOnce([
    { id: 1, title: "react", time: "10" },
    { id: 2, title: "git", time: "20" },
    { id: 3, title: "linux", time: "30" },
  ])
  // 削除のテスト
  .mockResolvedValueOnce([
    { id: 1, title: "react", time: "10" },
    { id: 2, title: "git", time: "20" },
    { id: 3, title: "linux", time: "30" },
  ])
  .mockResolvedValueOnce([
    { id: 1, title: "react", time: "10" },
    { id: 2, title: "git", time: "20" },
  ]) 
  // 追加のテスト
  .mockResolvedValueOnce([
    { id: 1, title: "react", time: "10" },
    { id: 2, title: "git", time: "20" },
  ])
  .mockResolvedValueOnce([
    { id: 1, title: "react", time: "10" },
    { id: 2, title: "git", time: "20" },
    {id: 3,title: "supabase",time:"10"}
  ])
  // 編集テスト
  .mockResolvedValueOnce([
    { id: 1, title: "react", time: "10" },
    { id: 2, title: "git", time: "20" },
    {id: 3,title: "supabase",time:"10"}
  ])
  .mockResolvedValue([
    { id: 1, title: "react", time: "10" },
    { id: 2, title: "git", time: "20" },
    {id: 3,title: "firebase",time:"10"}
  ]);

jest.mock("../lib/supabasefunctions", () => {
  return {
    getAllRecords: () => mockGetAllRecords(),
    addRecord: jest.fn(),
    deleteRecord: jest.fn(),
    updateRecord: jest.fn(),
  };
});

describe("学習記録アプリ全テスト", () => {
  beforeEach(() => {
    render(<App />);
  });

  /*---モック化を必要とするテスト---*/
  test("READ", async () => {
    await waitFor(() => {
      const recordList = screen.getByTestId("record-list");
      expect(recordList).toBeInTheDocument();
    });
  });

  test("削除", async () => {
    // 1回目のmockGetAllRecords
    await waitFor(() => {
      const recordList = screen.getByTestId("record-list");
      expect(recordList).toBeInTheDocument();
      const rows = recordList.querySelectorAll("tr");
      expect(rows.length - 1).toBe(3);
    });
    // 削除ボタンをクリックして削除処理を実行
    const deleteButtons = screen.getAllByTestId("delete-button");
    fireEvent.click(deleteButtons[0]);
    // 2回目のmockGetAllRecords
    await waitFor(() => {
      const recordList = screen.getByTestId("record-list");
      expect(recordList).toBeInTheDocument();
      const rows = recordList.querySelectorAll("tr");
      expect(rows.length - 1).toBe(2);
    });
  });

  test("追加", async ()=>{
    await waitFor(() => {
      const recordList = screen.getByTestId("record-list");
      expect(recordList).toBeInTheDocument();
      const rows = recordList.querySelectorAll("tr");
      expect(rows.length - 1).toBe(2);
    });
    const registerButton = screen.getByTestId("add-record-button");
    await userEvent.click(registerButton);
    const titleInput = screen.getByTestId("title-input");
    await userEvent.type(titleInput, "supabase");
    const timeInput = screen.getByTestId("time-input");
    await userEvent.type(timeInput, "10");
    userEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      const recordList = screen.getByTestId("record-list");
      expect(recordList).toBeInTheDocument();
      const rows = recordList.querySelectorAll("tr");
      expect(rows.length - 1).toBe(3);
    });
  })

  test("編集",async ()=>{
    await waitFor(() =>
      expect(screen.getByTestId("record-list")).toBeInTheDocument()
    );
    const editButtons = screen.getAllByTestId("update-button");
    userEvent.click(editButtons[0]);
    await waitFor(() =>
      expect(screen.getByText("学習記録を編集する")).toBeInTheDocument()
    );
    const titleInput = screen.getByTestId("title-input");
    userEvent.clear(titleInput);
    await userEvent.type(titleInput, "firebase");
    userEvent.click(screen.getByTestId("submit-button"));
    await waitFor(()=>screen.getByText("firebase"));
  })



  /*---完了済みのテスト---*/
  test("ローディング画面が見れる", () => {
    expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
  });
  test("新規登録ボタンがある", () => {
    expect(screen.getByTestId("add-record-button")).toBeInTheDocument();
  });
  test("タイトルがある", () => {
    expect(screen.getByTestId("isTitle")).toBeInTheDocument();
  });
  test("モーダルが新規登録というタイトルになっている", async () => {
    const registerButton = screen.getByTestId("add-record-button");
    userEvent.click(registerButton);
    await waitFor(() =>
      expect(screen.getByText("学習記録を登録する")).toBeInTheDocument()
    );
  });
  test("学習内容がないときに登録するとエラーが出る", async () => {
    const registerButton = screen.getByTestId("add-record-button");
    userEvent.click(registerButton);
    await waitFor(() => screen.getByTestId("submit-button"));
    const submitButton = screen.getByTestId("submit-button");
    userEvent.click(submitButton);
    await waitFor(() =>
      expect(
        screen.getByText("⚠️学習内容は必須入力項目です。")
      ).toBeInTheDocument()
    );
  });
  test("学習時間がないときに登録するとエラーが出る", async () => {
    const registerButton = screen.getByTestId("add-record-button");
    userEvent.click(registerButton);
    await waitFor(() => screen.getByTestId("submit-button"));
    const submitButton = screen.getByTestId("submit-button");
    userEvent.click(submitButton);
    await waitFor(() =>
      expect(
        screen.getByText("⚠️学習時間は必須入力項目です。")
      ).toBeInTheDocument()
    );
  });
  test("モーダルが記録編集というタイトルになっている", async () => {
    await waitFor(() =>
      expect(screen.getByTestId("record-list")).toBeInTheDocument()
    );
    const editButtons = screen.getAllByTestId("update-button");
    userEvent.click(editButtons[0]);
    await waitFor(() =>
      expect(screen.getByText("学習記録を編集する")).toBeInTheDocument()
    );
  });
  test("学習時間が1以上でないときに登録するとエラー", async () => {
    const registerButton = screen.getByTestId("add-record-button");
    userEvent.click(registerButton);
    await waitFor(() => {
      const submitButton = screen.getByTestId("submit-button");
      userEvent.click(submitButton);
    });
    await waitFor(() => {
      expect(
        screen.getByText("⚠️学習時間は必須入力項目です。")
      ).toBeInTheDocument();
    });
    const timeInput = screen.getByTestId("time-input");
    userEvent.clear(timeInput);
    await userEvent.type(timeInput, "-1");
    userEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => {
      expect(
        screen.getByText("⚠️学習時間は1以上である必要があります。")
      ).toBeInTheDocument();
    });
  });
});
