with open('src/app/page.tsx', 'r') as f:
    for i, line in enumerate(f, 1):
        if i == 14:
            print(repr(line))
            break
