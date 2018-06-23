export class StringUtils {
    static padRight(s: string, n: number, p: string = ' '): string {
        let ps: string = '';
        for (let i = 0; i < n; i++) {
            ps += p;
        }

        ps = s + ps;
        return ps.slice(0, n);
    }

    static wrap(s: string, n: number): string {
        let str: string = '';
        while (s.length > n) {
            str += s.substring(0, n) + '\n';
            s = s.substring(n, s.length);
        }
        str += s;
        return str;
    }
}