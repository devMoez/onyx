const CodeViewer = ({ code, language }: { code: string; language: string }) => {
  return (
    <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
      <code className={`language-${language} text-sm`}>{code}</code>
    </pre>
  );
};

export default CodeViewer;
