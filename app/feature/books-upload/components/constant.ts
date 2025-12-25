export const MOCK_AUTHORS = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Tác giả ${i + 1}`,
}));

export const MOCK_CATEGORIES = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Thể loại ${i + 1}`,
}));
