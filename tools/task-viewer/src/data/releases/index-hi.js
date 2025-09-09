// Release metadata only - actual content is loaded from /releases/*.md files
export const releaseMetadata = [
  {
    version: 'v4.1.0',
    date: '2025-09-06',
    title: 'टास्क पूर्णता सारांश स्टोरेज सिस्टम',
    summary: 'संरचित डेटा मॉडल और बुद्धिमान सारांश पार्सिंग क्षमताओं के साथ बेहतर टास्क पूर्णता विवरण'
  },
  {
    version: 'v4.0.0',
    date: '2025-09-03',
    title: 'उन्नत Release Notes और Archive सिस्टम',
    summary: 'प्रारंभिक अनुरोध प्रदर्शन के साथ कॉन्टेक्स्ट ट्रैकिंग, AI-संचालित सारांश, TOC के साथ बेहतर Release Notes, और व्यापक Archive प्रबंधन'
  },
  {
    version: 'v3.1.0',
    date: '2025-08-31',
    title: 'प्रारंभिक अनुरोध प्रदर्शन',
    summary: 'मूल उपयोगकर्ता अनुरोध को कैप्चर और प्रदर्शित करता है जिसने टास्क योजना शुरू की, टास्क सूचियों के लिए आवश्यक संदर्भ प्रदान करता है'
  },
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: 'अंतर्राष्ट्रीयकरण, टास्क हिस्ट्री, Sub-agents, Lightbox',
    summary: 'बहु-भाषा समर्थन, टेम्प्लेट अनुकूलन, प्रोजेक्ट हिस्ट्री, एजेंट प्रबंधन, इमेज lightbox, और प्रमुख UI सुधार'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: 'उन्नत टास्क प्रबंधन और VS Code Integration',
    summary: 'VS Code फाइल लिंक, बेहतर UUID प्रबंधन, dependencies कॉलम, और in-app release notes'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: 'प्रारंभिक स्टैंडअलोन रिलीज',
    summary: 'प्रोफाइल प्रबंधन, रीयल-टाइम अपडेट, और आधुनिक UI के साथ वेब-आधारित टास्क viewer'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};