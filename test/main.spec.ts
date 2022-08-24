import {run} from '../src/main'
import {makeMockGlob} from '../src/utils/mocks'

test('Selects each correctly', async () => {
    // Arrange
    const files = ["a.tmp", "b.tmp", "c.tmp", "d.tmp"];
    const mockGlob = makeMockGlob(files);
    const total_partitions = 4;
    const sortType = 'lexicographical';

    // Act
    for(let i=0;i<total_partitions;i++) {
        const result = await run(
            mockGlob,
            "",
            ["*"],
            i,
            total_partitions,
            sortType,
            " "
        );

        // Assert
        expect(result.count).toBe(1);
        expect(result.files).toBe(files[i]);
    }
});

test('Empty and zero if parition size larger than input', async () => {
    // Arrange
    const files = ["a.tmp", "b.tmp", "c.tmp", "d.tmp"];
    const mockGlob = makeMockGlob(files);
    const parition_index = 4;
    const total_partitions = 5;
    const sortType = 'lexicographical';

    // Act
    const result = await run(
        mockGlob,
        "",
        ["*"],
        parition_index,
        total_partitions,
        sortType,
        " "
    );

    // Assert
    expect(result.count).toBe(0);
    expect(result.files).toBe("");
});

test('Handle odd size', async () => {
    // Arrange
    const files = ["a.tmp", "b.tmp", "c.tmp", "d.tmp", "e.tmp"];
    const mockGlob = makeMockGlob(files);
    const total_partitions = 2;
    const sortType = 'lexicographical';

    // Act
    const result = await run(
        mockGlob,
        "",
        ["*"],
        0,
        total_partitions,
        sortType,
        " "
    );

    // Assert
    expect(result.count).toBe(3);
    expect(result.files).toBe("a.tmp b.tmp c.tmp");

    // Act
    const result2 = await run(
        mockGlob,
        "",
        ["*"],
        1,
        total_partitions,
        sortType,
        " "
    );

    // Assert
    expect(result2.count).toBe(2);
    expect(result2.files).toBe("d.tmp e.tmp");
});

test('Output delimiter', async () => {
    // Arrange
    const files = ["a.tmp", "b.tmp", "c.tmp", "d.tmp"];
    const mockGlob = makeMockGlob(files);
    const total_partitions = 1;
    const sortType = 'lexicographical';

    // Act
    const result = await run(
        mockGlob,
        "",
        ["*"],
        0,
        total_partitions,
        sortType,
        "|"
    );

    // Assert
    expect(result.count).toBe(4);
    expect(result.files).toBe(files.join("|"));
});

test('Lexicographical sort', async () => {
    // Arrange
    const files = ["e.tmp", "b.tmp", "s.tmp", "a.tmp", "l.tmp"];
    const mockGlob = makeMockGlob(files);
    const total_partitions = 2;
    const sortType = 'lexicographical';

    // Act
    const result = await run(
        mockGlob,
        "",
        ["*"],
        0,
        total_partitions,
        sortType,
        " "
    );

    // Assert
    expect(result.count).toBe(3);
    expect(result.files).toBe("a.tmp b.tmp e.tmp");
});

test('Shuffle sort', async () => {
    // Arrange
    const files = ["1.tmp", "5.tmp", "7.tmp", "3.tmp", "9.tmp"];
    const mockGlob = makeMockGlob(files);
    const total_partitions = 2;
    const sortType = 'random';

    // Act
    const result = await run(
        mockGlob,
        "5",
        ["*"],
        0,
        total_partitions,
        sortType,
        " "
    );

    // Assert
    expect(result.count).toBe(3);
    expect(result.files).toBe("1.tmp 3.tmp 5.tmp");
});
